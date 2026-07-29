const next = require("next");
const fs = require("fs");
const path = require("path");
const {parseCookie} = require("cookie");
const Maria = require("./utils/Maria");

const currpath = (res)=> path.join(__dirname, res);

global.DIR = {
    ROOT: fs.realpathSync(currpath('../')),
    PUBLIC : fs.realpathSync(currpath('../public'))
};

console.log('[PORT]', process.env.DB_PORT, parseInt(process.env.DB_PORT));

global.mariadb = new Maria({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT)
});

const express = require('express'),
    cors = require('cors'),
    http = require("http"),
    server = express(),
    {Server} = require('socket.io'),
    bodyParser = require('body-parser'),
    ThunderSpeed = require('./utils/thunderspeed.server'),
    {manage,serve} = require('./controller/socketManagement');

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV != "production";

const app = next({dev});
console.log("{LAUNCH>>>")
app.prepare().then(async ()=>{
    const httpServer = http.createServer(server);

    console.log("{PRETTY-READY>>>")

    const io = new Server(httpServer, {
        cors:{
            origin: process.env.SERVER_URL,
            methods: ["GET","POST"]
        }
    });

    const ths = new ThunderSpeed();
    ths.setResumable(true);
    ThunderSpeed.uploadDir = fs.realpathSync(currpath('./ths_tmp'));
    ThunderSpeed.baseDir = fs.realpathSync(currpath('./'));

    let requestConfig = {
        limit: '10mb'
    }

    server.use(cors())
    server.use(bodyParser.json(requestConfig))
    server.use(bodyParser.raw(requestConfig))
    server.use(ths.watch(['artimg','upl_pch','mailimg','upl_avt']))

    io.use((socket, next)=>{
        const cookieHeader = socket.handshake.headers.cookie;
        if(cookieHeader){
            try{
                const cookies = parseCookie(cookieHeader);
                const uuid = cookies["clientuid"];
                if(uuid){
                    socket.data.visitoruid = uuid;
                }

            }catch (e) {
                console.log('[ERROR SOCKET]',e);
            }
            return next();
        }
    });

    global.io = io;

    io.on("connection", (socket)=>manage(socket));

    server
    .post('/submit', (request,response)=> serve(request.body,response,ths))
    .post('/fetch', (request,response)=> serve(request.body,response,ths))
    .post('/connect', (request,response)=> serve(request.body,response,ths))
    .post('/upl_img', (request, response)=> serve(request.body,response,ths))
    .all("*", (req, res)=> app.getRequestHandler()(req, res));

    httpServer.listen(PORT);
});
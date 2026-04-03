const next = require("next");
const fs = require("fs");
const path = require("path");
const MongoSql = require("./utils/MongoSql");

const currpath = (res)=> path.join(__dirname, res);
global.DIR = {
    ROOT: fs.realpathSync(currpath('../')),
    PUBLIC : fs.realpathSync(currpath('../public'))
};
MongoSql.host = "queed.dev";
MongoSql.dbName = "museautop";

const express = require('express'),
    cors = require('cors'),
    http = require("http"),
    server = express(),
    {Server} = require('socket.io'),
    bodyParser = require('body-parser'),
    ThunderSpeed = require('./utils/thunderspeed.server'),
    {manage,serve} = require('./controller/socketManagement');
const initializeDatabase = require("./utils/database_init");

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV != "production";

const app = next({dev});
app.prepare().then(async ()=>{
    const httpServer = http.createServer(server);

    const io = new Server(httpServer, {
        cors:{
            origin: 'http://localhost:3000',
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

    io.on("connection", (socket)=>manage(socket));

    server
    .post('/submit', (request,response)=> serve(request.body,response,ths))
    .post('/fetch', (request,response)=> serve(request.body,response,ths))
    .post('/connect', (request,response)=> serve(request.body,response,ths))
    .post('/upl_img', (request, response)=> serve(request.body,response,ths))
    .all("*", (req, res)=> app.getRequestHandler()(req, res));

    httpServer.listen(PORT);
    await initializeDatabase();
});
const {randomUUID} = require("node:crypto");
const {Pdo} = require("../utils/Connect");
const Channel = require("../utils/Channel");
const Cookie = require("./Cookie");
class Client {

    static async create(){
        const uid = randomUUID();
        const created = await Cookie.set('clientuid', uid, {
            maxAge: 60 * 60 * 24 * 365,
            httpOnly: true,
            secure:true,
            path: "/",
            sameSite: 'lax'
        });
        if(created){
            await Client.save(uid);
            return uid;
        }
        return null;
    }

    static async save(uuid){
        try{
            await Pdo.prepare("insert into visitors (uid, last_seen, visites) values(:p1,NOW(),1)").execute({
                p1: uuid
            });
        }catch (e) {
            Channel.logError('[Error] saving client', e);
        }
    }

    static async attend(){
        const uuid = await Client.get();
        if(!uuid) return;
        try{
            await Pdo.prepare("update visitors set visites = visites + 1, last_seen=NOW() where uid=:p1").execute({
                p1: uuid
            });
        }catch (e) {
            Channel.logError('[Error] saving visites', e);
        }
    }

    static async get(){
        const uid = await Cookie.get("clientuid");
        if(!uid) return Client.create();
        return uid;
    }

    static async getTodayVisitors(){
        try{
            const request = await Pdo.prepare("select count(*) from visitors where DATE(last_seen) = CURDATE()").execute();
            return request.rowCount;
        }catch (e) {
            Channel.logError('[Error] checking visites', e);
        }
        return 0;
    }
    static async getCurrentVisitors(){
        try{
            const request = await Pdo.prepare("select count(*) from visitors where last_seen >= NOW() + interval 5 minute").execute();
            return request.rowCount;
        }catch (e) {
            Channel.logError('[Error] checking visites', e);
        }
        return 0;
    }
    static async getCumulatedVisites(){
        try{
            const request = await Pdo.prepare("select sum(visites) as visite from visitors").execute();
            if(request.rowCount) return request.fetch()["visite"];
        }catch (e) {
            Channel.logError('[Error] checking visites', e);
        }
        return 0;
    }
}

module.exports = Client;
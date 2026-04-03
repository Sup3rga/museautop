const Filter = require('../utils/Filter');
const Data = require('./Data');
const Channel = require('../utils/Channel');
const {Pdo} = require('../utils/Connect');
const code = require('../utils/ResponseCode');
const AkaDatetime = require('../utils/AkaDatetime');
const Subscriber = require("./Subscriber");
const Manager = require('./Manager');

class Mailing extends Data{
    constructor() {
        super();
        this.id = 0;
        this.client = 0;
        this.object = null;
        this.body = null;
        this.createdAt = null;
        this.createdBy = 0;
        this.postOn = null;
    }

    async save(){
        if(!Filter.contains(this, [
            'client', 'object', 'body', 'createdAt', 'createdBy', 'postOn'
        ], ['', null, 0])){
            return Channel.message({code: code.INVALID});
        }
        try{
            await Pdo.prepare(`
                insert into mailing(client, object, body, created_at, post_on, posted_by) 
                values(:p1,:p2,:p3,:p4,:p5,:p6)
            `).execute({
                p1: this.client,
                p2: this.object,
                p3: this.body,
                p4: this.createdAt,
                p5: this.postOn,
                p6: this.createdBy
            });
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await Mailing.getLast(this)
        });
    }

    async delete(){
        if(!this.id) return Channel.message({code:code.INVALID});
        try{
           await Pdo.prepare('delete from mailing where id=:p1')
               .execute({p1: this.id});
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            code: code.SUCCESS,
            error: false
        });
    }

    hydrate(data) {
        this.id = data.id;
        this.client = data.client;
        this.object = data.object;
        this.body = data.body;
        this.createdAt = new AkaDatetime(data.created_at).getDateTime();
        this.createdBy = data.posted_by;
        this.postOn = data.post_on;
        return this;
    }

    async data(){
        const data = Filter.object(this, [
            'id', 'client','object','createdAt','createdBy',
            'postOn','body'
        ]);
        data.client = await Subscriber.getById(data.client);
        if(data.client){
            data.client = await data.client.data();
        }
        data.createdBy = await (await Manager.getById(data.createdBy)).data(true, false, true);
        return data;
    }

    static async getById(id){
        let mail = null;
        try{
            const request = await Pdo.prepare('select * from mailing where id=:id')
                .execute({id});
            if(request.rowCount){
                mail = new Mailing().hydrate(request.fetch());
            }
        }catch (e){
            Channel.logError(e);
        }
        return mail;
    }

    static async getLast(src){
        let mail = null,
            queue = "",
            arg = {};
        if(src){
            queue = 'where posted_by=:p1 and created_at=:p2';
            arg = {p1: src.createdBy, p2: new AkaDatetime(src.createdAt).getDateTime()};
        }
        try{
            const req = await Pdo.prepare("select * from mailing "+queue+" order by id desc LIMIT 1")
                .execute(arg);
            if(req.rowCount){
                mail = new Mailing().hydrate(req.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return mail;
    }
}

module.exports = Mailing;
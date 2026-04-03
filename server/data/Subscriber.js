const Filter = require('../utils/Filter');
const Data = require('./Data');
const Channel = require('../utils/Channel');
const {Pdo} = require('../utils/Connect');
const code = require('../utils/ResponseCode');
const AkaDatetime = require('../utils/AkaDatetime');


class Subscriber extends Data{
    constructor() {
        super();
        this.id = 0;
        this.mail = null;
        this.contact = 0;
        this.news = 0;
        this.createdAt = null;
        this.branch = 0;
    }

    async save(){
        if(!Filter.contains(this, [
            'mail', 'contact', 'news', 'createdAt', 'branch'
        ]) || this.contact == this.news){
            return Channel.message({code: code.INVALID});
        }
        try{
            await Pdo.prepare(`
                insert into subscriber(mail, contact, news, created_at, branch) 
                values (:p1,:p2,:p3,:p4,:p5)
            `).execute({
                p1: this.mail,
                p2: this.contact,
                p3: this.news,
                p4: this.createdAt,
                p5: this.branch
            });
        }catch (e){
            Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code: code.SUCCESS
        });
    }

    async data(){
        return Filter.object(this, [
            'id', 'mail','contact','news', 'createdAt','branch'
        ]);
    }

    hydrate(data){
        this.id = data.id;
        this.mail = data.mail;
        this.contact = data.contact;
        this.news = data.news;
        this.createdAt = new AkaDatetime(data.created_at).getDateTime()
        this.branch = data.branch;
        return this;
    }

    static async getByEmail(email){
        let subscriber = null;
        try{
            const request = await Pdo.prepare('select * from subscriber where mail=:email')
                .execute({email});
            if(request.rowCount){
                subscriber = new Subscriber().hydrate(request.fetch());
            }
        }catch (e){
            Channel.logError(e);
        }
        return subscriber;
    }

    static async getById(id){
        let subscriber = null;
        try{
            const request = await Pdo.prepare('select * from subscriber where id=:id')
                .execute({id});
            if(request.rowCount){
                subscriber = new Subscriber().hydrate(request.fetch());
            }
        }catch (e){
            Channel.logError(e);
        }
        return subscriber;
    }
}

module.exports = Subscriber;
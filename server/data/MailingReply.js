const Mailling = require('./Mailing');
const Channel = require('../utils/Channel');
const {Pdo} = require('../utils/Connect');
const code = require('../utils/ResponseCode');

class MailingReply extends Mailling{
    constructor() {
        super();
        this.message = 0;
        this.reply = 0;
    }

    async save(){
        const saving = await super.save();
        console.log('[Save...]', this, saving);
        if(saving.error || !this.message){
            return saving;
        }
        try{
            await Pdo.prepare('insert into mail_reply(message, mail) values(:p1,:p2)')
            .execute({
                p1: this.message,
                p2: saving.data.id
            });
        }catch (e){
            await saving.data.delete();
            return Channel.logError(e).message({code:code.INTERNAL})
        }
        return saving;
    }

    async delete(){
        if(!this.reply) return Channel.message({code: code.INVALID});
        try{
            await Pdo.prepare('delete from mail_reply where id=:p1')
                .execute({p1: this.reply});
            return await super.delete();
        }catch (e){
            return Channel.message({code: code.INTERNAL});
        }
    }

    hydrate(data) {
        this.reply = data.reply;
        super.hydrate(data);
        return this;
    }

    static async getById(id){
        let reply = null;
        try{
            const req = await Pdo.prepare("select distinct r.id as reply, m.*  from mail_reply r, mailing m where r.id = :id and r.mail = m.id")
                .execute({id});
            if(req.rowCount){
                reply = new Mailling().hydrate(req.fetch());
            }
        }catch (e){
            Channel.logError(e);
        }
        return reply;
    }

    static async getByMessage(messageId, onlyData = true){
        let replies = [];
        try{
            const req = await Pdo.prepare("select distinct r.id as reply, m.*  from mail_reply r, mailing m where r.message = :messageId and r.mail = m.id")
                .execute({messageId});
            let data;
            while(data = req.fetch()){
                data = new Mailling().hydrate(data);
                replies.push(onlyData ? await data.data() : data);
            }
        }catch (e){
            Channel.logError(e);
        }
        return replies;
    }
}

module.exports = MailingReply;
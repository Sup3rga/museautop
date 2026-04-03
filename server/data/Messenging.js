const Data = require('./Data');
const Filter = require('../utils/Filter');
const Channel = require("../utils/Channel");
const code = require('../utils/ResponseCode');
const {Pdo} = require('../utils/Connect');
const Subscriber = require('./Subscriber');
const AkaDatetime = require('../utils/AkaDatetime');
const MailingReply = require("./MailingReply");

class Messenging extends Data{
    constructor() {
        super();
        this.id = 0;
        this.firstname = null;
        this.lastname = null;
        this.client = 0;
        this.message = null;
        this.postOn = null;
        this.readBy = 0;
        this.replies = [];
    }

    async save(){
        if(!Filter.contains(this, [
            'firstname','lastname','client','message','postOn'
        ], [null, '', 0])){
            return Channel.message({code: code.INVALID});
        }
        try{
            if(!this.id){
                await Pdo.prepare(`
                    insert into messenging (firstname, lastname, client, message, post_on)
                    values (:p1,:p2,:p3,:p4,:p5)
                `).execute({
                    p1: this.firstname,
                    p2: this.lastname,
                    p3: this.client,
                    p4: this.message,
                    p5: this.postOn
                })
            }
            else if(this.readBy){
                await Pdo.prepare(`
                    update messenging set read_by=:p1 where id=:p2
                `).execute({
                    p1: this.readBy,
                    p2: this.id
                });
            }
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await Messenging.getLast(this)
        });
    }

    async data(_public = false){
        const data = Filter.object(this, [
            'id', 'lastname', 'firstname', 'client',
            'message', 'readBy', 'postOn'
        ]);
        if(_public){
            Filter.flush(data, ['readBy', 'client']);
            data.read = this.readBy > 0;
        }
        else{
            data.replies = await MailingReply.getByMessage(this.id, true);
            data.client = await (await Subscriber.getById(data.client)).data();
        }
        return data;
    }

    hydrate(data) {
        this.id = data.id;
        this.lastname = data.lastname;
        this.firstname = data.firstname;
        this.client = data.client;
        this.message = data.message;
        this.readBy = data.read_by;
        this.postOn = new AkaDatetime(data.post_on).getDateTime();
        return this;
    }

    async delete(){
        if(!this.id) return Channel.message({code: code.INVALID});
        try{
            let saving;
            const list = await MailingReply.getByMessage(this.id, false);
            for(let i in list){
                saving = await list[i].delete();
                if(saving.error){
                    return saving;
                }
            }
            await Pdo.prepare("delete from messenging where id=:id").execute({id: this.id});
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code: code.SUCCESS
        })
    }

    /**
     *
     * @param id
     * @returns {Promise<null|Messenging>}
     */
    static async getById(id){
        let message = null;
        try{
            const request = await Pdo.prepare("select * from messenging where id=:id")
                .execute({id});
            if(request.rowCount){
                message = new Messenging().hydrate(request.fetch());
            }
        }catch (e){
            Channel.logError(e)
        }
        return message;
    }

    static async getLast(src=null){
        let message = null,
            queue = "",
            arg = {};
        if(src){
            queue = 'where post_on=:p2';
            arg = {p2: new AkaDatetime(src.postOn).getDateTime()};
        }
        try{
            const req = await Pdo.prepare("select * from messenging "+queue+" order by id desc LIMIT 1")
                .execute(arg);
            if(req.rowCount){
                message = new Messenging().hydrate(req.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return message;
    }

    static async fetchAll(branch, onlyData = true, _public = false){
        const list = [];
        try{
            const request = await Pdo.prepare(`
                    select distinct m.* from messenging m, subscriber s
                    where s.branch = :branch order by id desc
                `).execute({branch});
            let data;
            while(data = request.fetch()){
                data = new Messenging().hydrate(data);
                list.push(onlyData ? await data.data(_public) : data);
            }
        }catch (e){
            Channel.logError(e);
        }
        return list;
    }
}

module.exports = Messenging;
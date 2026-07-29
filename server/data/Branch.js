let {Pdo} = require('../utils/Connect'),
    Channel = require('../utils/Channel'),
    Data = require('./Data'),
    code = require('../utils/ResponseCode'),
    Constraint = require('../utils/Constraint'),
    Filter = require('../utils/Filter'),
    AkaDatetime = require('../utils/AkaDatetime');

class Branch extends Data{
    constructor() {
        super();
        this.id = 0;
        this.domain = null;
        this.name = null;
        this.createdAt = null;
    }

    async save(){
        if(
            !Filter.contains(this, ['domain','name','createdAt'], [null, '']) ||
            !Constraint.checkBranchName(this.name) ||
            !Constraint.checkDomain(this.domain)
        ){
            return Channel.message({code: code.INVALID});
        }
        try{
            const base = {
                p1: this.domain,
                p2: this.name
            };
            if(!this.id){
                await Pdo.prepare(`
                    insert into branch (domain, name, created_at) 
                    values (:p1,:p2,:p3)
                `).execute({
                    ...base,
                    p3: this.createdAt
                })
            }
            else{
                await Pdo.prepare(`
                    update branch set domain=:p1, name=:p2 where id=:p3
                `).execute({
                    ...base,
                    p3: this.id
                });
            }
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code: code.SUCCESS,
            data: this.id ? this : await Branch.getLast(this)
        });
    }

    async delete(){
        return Channel.message({code: code.DENIED_ACCESS});
    }

    hydrate(data) {
        this.id = data.id;
        this.name = data.name;
        this.domain = data.domain;
        this.createdAt = data.createdAt;
        return this;
    }

    data(){
        return Filter.object(this, ['id', 'name','domain','createdAt']);
    }

    static async getLast(src=null){
        let branch = null,
            queue = "",
            arg = {};
        if(src){
            queue = 'where created_at=:p2';
            arg = {p2: new AkaDatetime(src.createdAt).getDateTime()};
        }
        try{
            const req = await Pdo.prepare("select * from branch "+queue+" order by id desc LIMIT 1")
                .execute(arg);
            if(req.rowCount){
                branch = new Branch().hydrate(req.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return branch;
    }

    static async getById(id){
        let branch = null;
        try{
            const request = await Pdo.prepare("select * from branch where id=:id")
                .execute({id});
            if(request.rowCount){
                branch = new Branch().hydrate(request.fetch());
            }
        }catch (e){
            Channel.logError(e);
        }
        return branch;
    }

    static async fetchAll(onlyData = true){
        let result = await Pdo.prepare(`
            select * from branch
        `).execute({p1: this.id});
        let data, list = [];
        while(data = result.fetch()){
            data = new Branch().hydrate(data);
            if(onlyData){
                data = data.data();
            }
            list.push(data);
        }
        return list;
    }
}

module.exports = Branch;
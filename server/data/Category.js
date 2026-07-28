let {Channel, Pdo} = require('../utils/Connect'),
    Filter = require('../utils/Filter'),
    code = require('../utils/ResponseCode'),
    AkaDatetime = require('../utils/AkaDatetime'),
    Manager = require('./Manager'),
    TracableData = require('./TracableData');

class Category extends TracableData{

    static list = [];

    constructor() {
        super();
        this.name = null;
        this.id = 0;
        this.sector = null;
    }

    async save(){
        if(!Filter.contains(this, [
            'name', 'sector', 'createdAt','createdBy', 'branch'
        ], [null,0])){
            return Channel.message({
                code: code.INVALID
            });
        }
        if(this.id && !Filter.contains(this, ['modifiedBy', 'modifiedAt'], [null,0])){
            return Channel.message({code: code.INVALID});
        }
        if(!this.id){
            try{
                let db = await Pdo.prepare(`
                    insert into category (name, attached_to, created_by, created_at, modified_by, modified_at, branch)
                    values (:p1, :p2, :p3, :p4, :p3, :p4, :p5)
                `).execute({
                    p1: this.name,
                    p2: this.sector,
                    p3: this.createdBy,
                    p4:  new AkaDatetime(this.createdAt).getDateTime(),
                    p5: this.branch
                });
            }catch(e){
                Channel.logError(e);
                return Channel.message({code: code.INTERNAL});
            }
            return Channel.message({error: false, code: code.SUCCESS});
        }
        try{
            await Pdo.prepare(`
                update category set name = :p1, modified_by = :p2, modified_at = :p3
                where id = :p4
            `).execute({
                p1: this.name,
                p2: this.modifiedBy,
                p3: new AkaDatetime(this.modifiedAt).getDateTime(),
                p4: this.id
            });
        }catch(e){
            Channel.logError(e);
            return Channel.message({code: code.INTERNAL});
        }
        return Channel.message({error: false, code: code.SUCCESS});
    }

    hydrate(data) {
        this.id = data.id;
        this.name = data.name;
        this.sector = data.attached_to;
        this.createdAt = new AkaDatetime(data.created_at).getDateTime();
        this.createdBy = data.created_by;
        this.modifiedBy = data.modified_by;
        this.modifiedAt = new AkaDatetime(data.modified_at).getDateTime();
        this.branch = data.branch;
        return this;
    }

    async data(_public = false){
        const data = Filter.object(this, [
            'id', 'name',
            'sector',
            ...(_public ? [] : ['createdBy','createdAt', 'modifiedAt','modifiedBy', 'branch'])
        ]);
        if(!_public) {
            data.createdBy = await (await Manager.fetchById(data.createdBy)).data(true, false, true);
            data.modifiedBy = await (await Manager.getById(data.modifiedBy)).data(true, false, true);
        }
        return data;
    }

    async delete(){
        if(!this.id){
            return Channel.message({code: code.INVALID});
        }
        try{
            await Pdo.prepare(`
                delete from category where id = :p1   
            `).execute({
                p1: this.id
            });
        }catch(e){
            return Channel.logError(e).message({code: code.INVALID});
        }
        return Channel.message({error: false, code: code.SUCCESS});
    }

    static async fetchAll(branch,type = 'A', dataOnly = true,_public=false, includeEmpty=true){
        let  result = [];
        try {
            let filter = includeEmpty ? '': ` and (select count(*) from ${type === 'A' ? 'articles' : 'punchlines'} where category = c.id) > 0`;
            let req = await Pdo.prepare("select c.* from category c where c.attached_to=:p1 and c.branch=:p2"+filter)
                                .execute({
                                    p1: type,
                                    p2: branch
                                });
            if (req.rowCount) {
                let data,res;
                while(data = req.fetch()) {
                    res = new Category().hydrate(data);
                    if(dataOnly){
                        res = await res.data(_public);
                    }
                    result.push(res);
                }
            }
        }catch(e){
            Channel.logError(e);
        }
        return result;
    }

    static async getById(id){
        let category = null;
        // console.log('[Category ID]', id);
        try {
            let request = await Pdo.prepare("select * from category where id=:id")
                                    .execute({id});
            // console.log('[count categories]',request.rowCount);
            if(request.rowCount){
                category = new Category().hydrate(request.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return category;
    }
}

module.exports = Category;
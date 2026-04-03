const Data = require('./Data'),
      Channel = require('../utils/Channel'),
      Filter = require('../utils/Filter');
const code = require('../utils/ResponseCode');
const {Pdo} = require('../utils/Connect');
const AkaDatetime = require('../utils/AkaDatetime');
const Sys = require('./Sys');
const {is_file,unlink} = require('../utils/procedures')

class Pictures extends Data{
    constructor() {
        super();
        this.id = 0;
        this.path = null;
    }

    async save(){
        if(!Filter.contains(this, [
            'path', 'createdAt', 'createdBy'
        ], ['', null, 0])){
            return Channel.message({
                code: code.INVALID
            });
        }
        try{
            await Pdo.prepare("insert into pictures (path, created_by, created_at) values(:p1,:p2,:p3)")
            .execute({
                p1: this.path,
                p2: this.createdBy,
                p3: new AkaDatetime(this.createdAt).getDateTime()
            });
        }catch (e){
            Channel.message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await Pictures.getLast(this)
        });
    }

    async delete(){
        if(!this.id){
            Channel.message({code: code.INVALID});
        }
        try{
            await Pdo.prepare("delete from pictures where id=:id").execute({id: this.id});
        }catch(e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        if(await is_file(DIR.PUBLIC+this.path)){
            await unlink(DIR.PUBLIC+this.path);
        }
        return Channel.message({code: code.SUCCESS});
    }

    data(){
        return Filter.object(this, ['id','path','createdBy','createdAt']);
    }

    hydrate(data) {
        this.id = data.id;
        this.path = data.path;
        this.createdBy = data.created_by;
        this.createdAt = new AkaDatetime(data.created_at).getDateTime();
        return this;
    }

    static async getById(id){
        let pic = null;
        try{
            let result = await Pdo.prepare("select * from pictures where id=:p1")
                .execute({p1: id});
            if(result.rowCount){
                pic = new Pictures().hydrate(result.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return pic;
    }

    static async getLast(src = null){
        let pic = null,
            queue = "",
            arg = {};
        if(src){
            queue = 'where created_by=:p1 and created_at=:p2';
            arg = {p1: src.createdBy, p2: new AkaDatetime(src.createdAt).getDateTime()};
        }
        try{
            const req = await Pdo.prepare("select * from pictures "+queue+" order by id desc LIMIT 1")
                .execute(arg);
            if(req.rowCount){
                pic = new Pictures().hydrate(req.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return pic;
    }

    static async getByPath(path){
        let pic = null;
        try{
            let result = await Pdo.prepare("select * from pictures where path=:p1")
                .execute({p1: path});
            if(result.rowCount){
                pic = new Pictures().hydrate(result.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return pic;
    }

    static async nextName(sector){
        let index = await Sys.get('imginc');
        if(!index){
            index = 0;
        }
        else{
            index = parseInt(index);
        }
        index++;
        let name = '';
        switch (sector.toLowerCase()){
            case 'a':
                name = 'artimg' + index;
            break;
            case 'p':
                name = 'pchimg' + index;
                break;
            default:
                name = 'img' + index;
                break;
        }
        await Sys.set('imginc', index);
        return name;
    }

    static extension(value){
        return value.replace(/^(?:[\S]+)\.([\S]+)$/, '$1');
    }

    static baseName(value){
        return value.replace(/^([\S]+)\.(?:[\S]+)$/, '$1');
    }
}

module.exports = Pictures;
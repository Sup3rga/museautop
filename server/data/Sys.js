const {Pdo} = require('../utils/Connect');
const Channel = require('../utils/Channel');
const code = require('../utils/ResponseCode');

class Sys{
    static async set(index, value){
        try {
            if (await this.get(index) === null) {
                await Pdo.prepare("insert into sys_pref values(:index, :value)").execute({index,value});
            } else {
                await Pdo.prepare("update sys_pref set content=:value where metadata=:index").execute({index,value});
            }
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code: code.SUCCESS
        });
    }

    static async get(index){
        let result = null;
        try{
            const req = await Pdo.prepare("select content from sys_pref where metadata=:index")
                .execute({index});
            if(req.rowCount){
                result = req.fetch().content;
            }
        }catch (e){
            Channel.logError(e);
        }
        if(/^[0-9]+(\.[0-9]+)?$/.test(result)){
            result *= 1;
        }
        else if(['false','true'].indexOf(result) >= 0){
            result = result === 'true';
        }
        return result;
    }
}

module.exports = Sys;
let {Pdo} = require('../utils/Connect'),
    Channel = require('../utils/Channel'),
    Data = require('./Data');

class SponsoredData extends Data{

    static async getSponsored(cls, table, minQty, branch, dataOnly = true, forPublic = false){
        const list = [];
        try{
            let request = await Pdo.prepare(`
                select * from ${table} where sponsored_until >= NOW()
            `).execute();
            let data;
            if(request.rowCount){
                while(data = request.fetch()){
                    data = new cls().hydrate(data);
                    list.push(dataOnly ? await data.data() : data);
                    minQty--;
                }
                if(minQty > 0){
                    request = await Pdo.prepare(`
                        select * from ${table} 
                        where 
                              sponsored_until is null or
                              sponsored_until < NOW()
                        order by id desc limit :p1
                    `).execute({p1: minQty});

                    while(data = request.fetch()){
                        data = new cls().hydrate(data);
                        list.push(dataOnly ? await data.data() : data);
                    }
                }
            }

        }catch (e){
            Channel.logError(e);
        }
        return list;
    }
}

module.exports = SponsoredData;
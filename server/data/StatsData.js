const TracableData = require("./TracableData");
const Stats = require("./Stats");
const {Pdo} = require("../utils/Connect");
const Channel = require("../utils/Channel");
const code = require("../utils/ResponseCode");
const Client = require("./Client");

class StatsData extends TracableData{

    constructor() {
        super();
        this.id = 0;
        this.stats = 0;
        this.table = "";
        this.statsData = null;
        this.uuid = null;
    }
    async getStats(){
        this.statsData = await Stats.getById(this.stats);
        return this.statsData;
    }

    async alreadyLike(){
        if(!this.uuid) return null;
        try{
            const request = await Pdo.prepare("select * from interaction_registry where id=:p1 and uid=:p2 and stats='likes'").execute({
                p1: this.statsData.id,
                p2:this.uuid
            });
            if(request.rowCount){
                return true;
            }
        }catch (e) {
            Channel.logError("[Error db]",e);
            return null;
        }
        return false;
    }

    async alreadyView(){
        if(!this.uuid) return null;
        try{
            const request = await Pdo.prepare("select * from interaction_registry where uid=:p2 and id=:p1 and stats='views'").execute({
                p1: this.statsData.id,
                p2:this.uuid
            });
            if(request.rowCount){
                return true;
            }
        }catch (e) {
            Channel.logError("[Error db]",e);
            return null;
        }
        return false;
    }

    async updateLikes(){
        if(!this.uuid) return false;
        await this.getStats();
        try{
            const check = await this.alreadyLike();
            if(check === null) return false;
            await Pdo.prepare(!check ?
                "insert into interaction_registry(id,uid, stats) values (:p1, :p2,'likes')" :
                "delete from interaction_registry where uid=:p2 and id=:p1 and stats='likes'"
            ).execute({
                p1: this.statsData.id,
                p2: this.uuid
            });
            await Channel.pause(50);
            return true;
        }catch (e) {
            Channel.logError("[Error likes update]",e);
        }
        return false;
    }

    async updateViews(){
        if(!this.uuid) return false;
        await this.getStats();
        try{
            const check = await this.alreadyView();
            if(check === null) return false;
            if(!check) {
                await Pdo.prepare("insert into interaction_registry(id, uid, stats) values (:p1, :p2,'views')").execute({
                    p1: this.statsData.id,
                    p2: this.uuid
                });
            }
            return true;
        }catch (e) {
            Channel.logError("[Error views update]",e, '/', this.uuid);
        }
        return false;
    }

    async updateVisites(){
        try{
            await Pdo.prepare(`
                    update interaction set visites= visites + 1
                    where id = (select distinct stats from ${this.table} where id = :id)
`           ).execute({
                id: this.id
            });
        }catch (e) {
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code : code.SUCCESS
        });
    }
}

module.exports = StatsData;
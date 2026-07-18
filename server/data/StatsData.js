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
    }
    async getStats(){
        this.statsData = await Stats.getById(this.stats);
        return this.statsData;
    }

    async updateLikes(unset = false){
        const clientuid = await Client.get();
        try{

        }catch (e) {

        }
    }

    async updateStats({views, likes, dislikes, visites}){
        try{
            await Pdo.prepare(`
                    update interaction set likes =:likes, views=:views, dislikes=:dislikes, visites=:visites
                    where id = (select distinct stats from ${this.table} where id = :id)
`           ).execute({
                id: this.id,
                likes, views, dislikes, visites
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
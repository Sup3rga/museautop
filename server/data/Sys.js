const {Pdo} = require('../utils/Connect');
const Channel = require('../utils/Channel');
const code = require('../utils/ResponseCode');
const Branch = require("./Branch");
const Filter = require("../utils/Filter");

class Sys{
    constructor() {
        this.cardWidth = 400;
        this.cardHeight = 400;
        this.cardBg = "#ddd";
        this.cardBandBg = "#fff";
        this.cardTextColor = "#fff";
        this.cardBandColor = "#000";
        this.readingVisible = 0;
        this.likesVisible = 0;
        this.authorVisible = 1;
        this.readingVisibilitylimit = 0;
        this.likesVisibilitylimit = 0;
        this.readingVisibleWithCondition = 0;
        this.likesVisibleWithCondition = 0;
        this.homeArticleQty = 4;
    }

    static cache = {};

    data(_public){
        return Filter.object(this, [
            ...(_public ? [] : ['cardWidth', 'cardHeight','cardBg','cardBandBg','cardTextColor','cardBandColor']),
            'readingVisible','likesVisible', 'authorVisible',
            'readingVisibilitylimit', 'likesVisibilitylimit',
            'readingVisibleWithCondition', 'likesVisibleWithCondition'
        ]);
    }
    static async set(index, value){
        try {
            if (await this.get(index) === null) {
                await Pdo.prepare("insert into sys_pref values(:index, :value)").execute({index,value});
            } else {
                await Pdo.prepare("update sys_pref set content=:value where metadata=:index").execute({index,value});
            }
            Sys.cache = {};
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({
            error: false,
            code: code.SUCCESS
        });
    }

    static async getAll(branch){
        branch *= 1;
        if(typeof branch !== 'number') return null;
        if(!(await Branch.getById(branch))) return null;
        if(branch in Sys.cache) return Sys.cache[branch];

        const pref = new Sys();
        const settings = [
            'cardWidth', 'cardHeight','cardBg','cardBandBg','cardTextColor','cardBandColor',
            'readingVisible','likesVisible', 'authorVisible',
            'readingVisibilitylimit', 'likesVisibilitylimit',
            'readingVisibleWithCondition', 'likesVisibleWithCondition'
        ].map((e)=>`'${e + branch}\'`);
        try{
            const request = await Pdo.prepare(`select * from sys_pref where metadata in (${settings.join(",")})`).execute();
            if(request.rowCount){
                let data;
                while(data = request.fetch()){
                    pref[data.metadata.replace(/[0-9]+$/, '')] = Sys.normalize(data.content);
                }
            }
            Sys.cache[branch] = pref;
        }catch (e) {
            Channel.logError(e);
            return null;
        }
        return pref;
    }

    static normalize(result){
        if(/^[0-9]+(\.[0-9]+)?$/.test(result)){
            result *= 1;
        }
        else if(['false','true'].indexOf(result) >= 0){
            result = result === 'true';
        }
        return result;
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
        result = Sys.normalize(result);
        return result;
    }
}

module.exports = Sys;
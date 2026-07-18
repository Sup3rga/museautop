const Data = require("./Data");
const Filter = require("../utils/Filter");
const {Pdo} = require("../utils/Connect");
const Channel = require("../utils/Channel");

class Stats{
    constructor() {
        this.id = 0;
        this.likes = 0;
        this.dislikes = 0;
        this.views = 0;
        this.visites = 0;
    }

    async save(){
        try{
            await Pdo.prepare("update interaction set likes=:likes, dislikes=:dislikes, views=:views, visites=:visites where id=:id").execute(Filter.object(this, [
                'likes', 'dislikes', 'views', 'visites', 'id'
            ]))
        }catch (e) {

        }
    }
    async data(_public = false){
        return Filter.object(this, [
            'likes', 'dislikes', 'views', ...(_public ? [] : ['visites'])
        ]);
    }
    hydrate(data){
        this.id = data.id;
        this.likes = data.likes;
        this.dislikes = data.dislikes;
        this.views = data.views;
        this.visites = data.visites;
        return this;
    }

    static async getById(id){
        let stats = null;
        try{
            const request = await Pdo.prepare("select * from interaction where id=:id").execute({id});
            if(request.rowCount){
                stats = new Stats().hydrate(request.fetch());
            }
        }catch (e){
            Channel.logError(e);
        }
        return stats;
    }
}

module.exports = Stats;
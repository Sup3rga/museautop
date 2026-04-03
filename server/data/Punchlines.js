const TracableData = require("./TracableData");
const Filter = require("../utils/Filter");
const Pictures = require("./Pictures");
const Category = require("./Category");
const code = require("../utils/ResponseCode");
const Channel = require("../utils/Channel");
const {Pdo} = require("../utils/Connect");
const {in_array} = require("../utils/procedures");
const AkaDatetime = require("../utils/AkaDatetime");
const Manager = require("./Manager");

class Punchlines extends TracableData{

    constructor() {
        super();
        this.id = 0;
        this.title = null;
        this.picture = 0; //base picture as punchline card background
        this.card = 0; //punchline card
        this.year = 0;
        this.watches = 0;
        this.artist = null;
        this.lyrics = null;
        this.punchline = null;
        this.category = 0;
        this.comment = null;
        this.postOn = null;
        this.sponsoredUntil = null;
    }

    async data(_public = true){
        const data = Filter.object(this, [
            'id','title','card', 'year', 'artist', 'lyrics', 'punchline',
            'category', 'comment', 'postOn',
            'createdBy', 'branch', 'sponsoredUntil',
            ...(_public ? [] : ['createdAt','modifiedAt','modifiedBy','picture',])
        ]);
        data.card = (await Pictures.getById(data.card)).data();
        if(!_public) {
            data.picture = (await Pictures.getById(data.picture)).data();
            data.category = await (await Category.getById(data.category)).data();
            data.createdBy = await (await Manager.getById(data.createdBy)).data(true, false, true);
            data.modifiedBy = await (await Manager.getById(data.modifiedBy)).data(true, false, true);
        }
        else{
            data.card = data.card.path;
            Filter.flush(data, [
                'createdBy','createdAt', 'picture',
                'modifiedAt', 'modifiedBy'
            ]);
        }
        return data;
    }

    async read(){
        try{
            await Pdo.prepare(`
                update punchlines set watches=:p1 where id=:p2
            `).execute({
                p1: this.watches + 1,
                p2: this.id
            });
        }catch (e){
            Channel.logError(e)
        }
    }

    hydrate(data) {
        this.id = data.id;
        this.title = data.title;
        this.picture = data.presentation;
        this.card = data.picture;
        this.punchline = data.punchline;
        this.year = data.year;
        this.lyrics = data.lyrics;
        this.category = data.category;
        this.watches = data.watches;
        this.artist = data.artist;
        this.comment = data.comment;
        this.branch = data.branch;
        this.createdBy = data.created_by;
        this.createdAt = new AkaDatetime(data.created_at).getDateTime();
        this.modifiedBy = data.modified_by;
        this.modifiedAt = new AkaDatetime(data.modified_at).getDateTime();
        this.postOn = new AkaDatetime(data.post_on).getDateTime();
        this.sponsoredUntil = !data.sponsored_until ? null : new AkaDatetime(data.sponsored_until).getDateTime();
        return this;
    }

    async savePicture(path){
        const picture = new Pictures();
        picture.path = path;
        picture.createdBy = this[this.id ? 'modifiedBy' : 'createdBy'];
        picture.createdAt = this[this.id ? 'modifiedBy' : 'createdBy'];
        return await picture.save();
    }

    async save(){
        let _code = code.SUCCESS;
        if(!Filter.contains(this, [
            'title', 'picture','card','punchline', 'year','artist', 'punchline',
            'createdBy', 'createdAt', 'postOn'
        ], [null,0,'']) ||
            (
                this.id && !Filter.contains(this, [
                    'modifiedAt','modifiedBy'
                ])
            )
        ){
            return Channel.message({code: code.INVALID});
        }
        const _delpictures = [];
        try {
            let _self, old, saving,
                updatable = this.id && [typeof this.picture, typeof  this.card].indexOf('string') >= 0;
            if(updatable) {
                _self = await Punchlines.getById(this.id);
            }
            const _job = async (index)=>{
                saving = null;
                if(typeof this[index] === 'string') {
                    saving = await this.savePicture(this[index]);
                    if (updatable) {
                        old = await Pictures.getById(_self[index]);
                        _delpictures.push(old);
                    }
                    if (!saving.error) {
                        if (!saving.data) {
                            _code = code.PICTURE_UPDATE_ERROR;
                            return Channel.message({code: _code})
                        }
                        this[index] = saving.data.id;
                    } else {
                        _code = code.PICTURE_UPDATE_ERROR;
                        if (updatable) {
                            _delpictures.pop();
                            this[index] = old.id;
                        } else {
                            return Channel.message({code: _code})
                        }
                    }
                }
            }
            if(this.id && /^[0-9]+$/.test(this.picture)){
                this.picture = null;
            }
            let task;
            if(task = await _job('card')) return task;
            if (task = await _job('picture')) return task;

            const base = {
                p1: this.picture,
                p2: this.card,
                p3: this.title,
                p4: this.artist,
                p5: this.lyrics,
                p6: this.punchline,
                p7: this.year,
                p8: this.category,
                p9: this.comment,
                p12: this.postOn,
            }
            if(!this.id) {
                await Pdo.prepare(`
                    insert into punchlines(presentation, picture, title, artist, lyrics, punchline, year, category,
                                           comment, created_at, created_by, modified_at, modified_by, post_on, branch)
                    values (:p1, :p2, :p3, :p4, :p5, :p6, :p7, :p8, :p9, :p10, :p11, :p10, :p11, :p12, :p13)
                `).execute({
                    ...base,
                    p10: this.createdAt,
                    p11: this.createdBy,
                    p13: this.branch
                });
            }else{
                if(!base.p1){
                    delete base.p1;
                }
                await Pdo.prepare(`
                    update punchlines set `+(this.picture ? 'presentation = :p1,' : '')+`
                        picture=:p2, title = :p3, artist = :p4,
                        lyrics=:p5, punchline=:p6, year=:p7, category=:p8, comment=:p9,
                        modified_at=:p10, modified_by=:p11, post_on=:p12
                    where id = :p13
                `).execute({
                    ...base,
                    p10: this.modifiedAt,
                    p11: this.modifiedBy,
                    p13: this.id
                });
            }
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        for(let i in _delpictures){
            await _delpictures[i].delete();
        }
        return Channel.message({
            error: false,
            code : _code
        });
    }

    async sponsorUntil(date){
        date = new AkaDatetime(date);
        if(!this.id) return Channel.message({code: code.INVALID});
        try{
            await Pdo.prepare("update punchlines set sponsored_until=:p1 where id=:p2")
                .execute({p1: date.getDateTime(), p2: this.id});
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({code: code.SUCCESS, error: false});
    }

    /**
     *
     * @param id
     * @returns {Promise<Punchlines>}
     */
    static async getById(id){
        let punchline = null;
        try{
            const request = await Pdo.prepare("select * from punchlines where id=:id").execute({id});
            if(request.rowCount){
                punchline = new Punchlines().hydrate(request.fetch());
            }
        }catch (e){
            Channel.logError(e);
        }
        return punchline;
    }

    static async fetchAll(branch = 0, dataOnly = true, _public = false, sponsored=false){
        const r = [];
        try{
            const results = await Pdo.prepare("select * from punchlines where branch=:branch order by id desc")
                .execute({branch});
            let data;
            while(data = results.fetch()){
                data = new Punchlines().hydrate(data);
                if(!sponsored ||
                    (sponsored && new AkaDatetime(data.sponsoredUntil).isMoreThan(new AkaDatetime()))
                ){
                    r.push(dataOnly ? await data.data(_public) : data);
                }
            }
        }catch (e){
            Channel.logError(e);
        }
        return r;
    }

    static async fetchYears(branch){
        const list = [];
        try{
            const request = await Pdo.prepare("select year from punchlines where branch=:branch")
                .execute({branch});
            let data;
            while(data = request.fetch()){
                if(!in_array(list, data.year, true)){
                    list.push(data.year);
                }
            }
        }catch (e){
            Channel.logError(e);
        }
        return list;
    }

    static async fetchArtists(branch){
        const list = [];
        try{
            const request = await Pdo.prepare("select artist from punchlines where branch=:branch")
                .execute({branch});
            let data;
            while(data = request.fetch()){
                if(!in_array(list, data.artist, true)){
                    list.push(data.artist);
                }
            }
        }catch (e){
            Channel.logError(e);
        }
        return list;
    }
}

module.exports = Punchlines;
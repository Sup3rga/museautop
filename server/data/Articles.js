let {Pdo} = require('../utils/Connect'),
    Channel = require('../utils/Channel'),
    Filter = require('../utils/Filter'),
    Pictures = require('./Pictures'),
    Data = require('./Data'),
    Manager = require('./Manager'),
    Category = require('./Category'),
    AkaDatetime = require('../utils/AkaDatetime'),
    code = require('../utils/ResponseCode'),
    {filter,set} = require('../utils/procedures'),
    Sys = require('./Sys');
const SponsoredData = require("./SponsoredData");

class ArticleImage extends Data{
    constructor() {
        super();
        this.id = 0;
        this.article = 0;
        this.picture = 0;
        this.path = null;
    }

    async save(){
        try{
            await Pdo.prepare("insert into articles_pictures(img,article) values(:img, :art)")
                .execute({img: this.picture, art: this.article});
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({code: code.SUCCESS});
    }

    async data(){
        return Filter.object(this, ['id', 'path', 'article', 'picture']);
    }

    async delete(){
        if(!this.id){
            return false;
        }
        try{
            const pic = Pictures.getById(this.picture);
            await Pdo.prepare("delete from articles_pictures where id=:id").execute({id: this.id});
            if(pic) {
                pic.delete();
            }
        }catch (e) {
            Channel.logError(e);
            return false;
        }
        return true;
    }

    hydrate(data) {
        this.id = data.id;
        this.article = data.article;
        this.picture = data.img;
        this.path = data.path;
        return this;
    }

    static async getByPath(path, nullValue = true){
        let res = null;
        const img = await Pictures.getByPath(path);
        if(img){
            try {
                const req = await Pdo.prepare("select distinct a.*, p.path from articles_pictures a, pictures p where a.img=:img and p.id = a.img")
                    .execute({img : img.id});
                if(req.rowCount){
                    res = new ArticleImage().hydrate(req.fetch());
                }
            }catch (e) {
                Channel.logError(e);
            }
        }
        return nullValue ? res : res ? res : new ArticleImage();
    }

    static async getById(id){
        let res = null;
        try {
            const req = await Pdo.prepare("select distinct a.*, p.path from articles_pictures a, pictures p where a.id=:id and p.id = a.img")
                .execute({id});
            if(req.rowCount){
                res = new ArticleImage().hydrate(req.fetch());
            }
        }catch (e) {
            Channel.logError(e);
        }
        return res;
    }

    static async fetchAll(id){
        const list = [];
        try{
            const req = await Pdo.prepare("select * from articles_pictures where article=:id")
                .execute({id});
            if(req.rowCount){
                let data;
                while(data = req.fetch()){
                    list.push(new ArticleImage().hydrate(data));
                }
            }
        }catch (e) {
            Channel.logError(e);
        }
        return list;
    }

    static async deleteOld(id){
        const list = await ArticleImage.fetchAll(id);
        for(let i in list){
            list[i].delete();
        }
        return ArticleImage;
    }

    static async setNew(id, cmid, list){
        try{
            let pic = null, result, artpic;
            for(let i in list){
                pic = new Pictures();
                pic.path = list[i];
                pic.createdAt = AkaDatetime.now();
                pic.createdBy = cmid;
                result = await pic.save();
                if(!result.error){
                    pic = await Pictures.getLast(pic);
                    if(pic){
                        artpic = new ArticleImage();
                        artpic.picture = pic.id;
                        artpic.article = id;
                        await artpic.save();
                    }
                }
            }
        }catch (e){
            Channel.logError(e);
        }
        return ArticleImage;
    }
}

class Articles extends SponsoredData{
    static list = [];

    constructor() {
        super();
        this.id = 0;
        this.title = null;
        this.caption = null;
        this.content = null;
        this.createdAt = null;
        this.createdBy = null;
        this.modifiedAt = null;
        this.modifiedBy = null;
        this.reading = 0;
        this.likes = 0;
        this.dislikes = 0;
        this.pictures = [];
        this.category = 0;
        this.branch = 0;
        this.published = false;
        this.postOn = null;
        this.sponsoredUntil = null;
    }

    async data(_public = false){
        const data = Filter.object(this, [
           'id', 'title', 'caption','content',
           'createdBy', 'reading', 'likes','dislikes',
           'category', 'branch', 'postOn',
            ...(_public ? [] : ['modifiedAt','modifiedBy','published','createdAt','sponsoredUntil'])
        ]);
        if(data.caption) {
            data.caption = await (await ArticleImage.getById(data.caption)).data();
            data.caption = data.caption.path;
        }
        data.createdBy = await (await Manager.getById(data.createdBy)).data(true, false, true);
        if(!_public) {
            data.modifiedBy = await (await Manager.getById(data.modifiedBy)).data(true, false, true);
        }
        data.category = await (await Category.getById(data.category)).data();
        data.category = Filter.object(data.category, ['id', 'name', 'sector']);
        return data;
    }

    async save(){
        // console.log('[This]',this);
        if(!Filter.contains(this, [
            'title','content','createdAt','createdBy','branch', 'postOn','category'
        ], [null, 0, ''])){
            return Channel.message({code: code.INVALID});
        }
        if(this.id && !Filter.contains(this, ['modifiedBy', 'modifiedAt'])){
            return Channel.message({code: code.INVALID});
        }
        /**
         * If it's an update, we must delete ressources which are not indexed from
         * the new ressources list
         */
        if(this.id){
            let list = ArticleImage.fetchAll(this.id);
            for(let i in list){
                if(this.pictures.indexOf(list[i].path) < 0){
                    list[i].delete();
                }
                else{
                    this.pictures = filter(this.pictures, list[i].path);
                }
            }
        }
        //article
        let article = this;
        try{
            //Insertion
            if(!this.id){
                await Pdo.prepare(`
                    insert into articles (
                      title,content,created_at,created_by,modified_at,modified_by,
                      category,branch,post_on
                    )
                    values(:p1,:p3,:p4,:p5,:p4,:p5,:p6,:p7,:p8)
                `)
                .execute({
                    p1: this.title,
                    p3: this.content,
                    p4: new AkaDatetime(this.createdAt).getDateTime(),
                    p5: this.createdBy,
                    p6: this.category,
                    p7: this.branch,
                    p8: new AkaDatetime(this.postOn).getDateTime()
                });
                article = await Articles.getLast(this);
            }
            else {
                //Update
                await Pdo.prepare(`
                    update articles
                    set title       = :p1,
                        content     = :p3,
                        modified_by = :p5,
                        modified_at = :p4,
                        category    = :p6,
                        post_on = :p9
                    where id = :p7
                      and branch = :p8
                `)
                .execute({
                    p1: this.title,
                    p3: this.content,
                    p4: new AkaDatetime(this.createdAt).getDateTime(),
                    p5: this.createdBy,
                    p6: this.category,
                    p7: this.id,
                    p8: this.branch,
                    p9: this.postOn
                });
            }
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        if(article) {
            //We update the ressource list
            await ArticleImage.setNew(article.id, article[!this.id ? 'createdBy' : 'modifiedBy'], this.pictures);
            //We get the ressource list data
            const list = await ArticleImage.fetchAll(article.id);
            console.log('[After]',this.pictures, list);
            //Then we update the current Caption
            try {
                await Pdo.prepare('update articles set caption=:p1 where id=:p2')
                    .execute({
                        p1: list.length ? list[0].id : null,
                        p2: article.id
                    });
            } catch (e) {
                Channel.logError(e);
            }
        }
        return Channel.message({error: false, code: code.SUCCESS});
    }

    async delete(){
        if(!this.id){
            return Channel.message({code: code.INVALID});
        }
        try {
            await Pdo.prepare("delete from articles where id=?")
                .execute({id: this.id});
        }catch(e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({error: false, code: code.SUCCESS});
    }

    async updateStats(metadata, value){
        try{
            await Pdo.prepare(`
                update articles set ${metadata}=:p1 where id=:p2
            `).execute({
                p1: value,
                p2: this.id
            });
            return Channel.message({
                error: false,
                code: code.SUCCESS
            });
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
    }

    async read(){
        const req = await this.updateStats('reading', this.reading+1);
        if(!req.error){
            this.reading++;
        }
    }

    async like(){
        const req = await this.updateStats('likes', this.likes+1);
        if(!req.error){
            this.likes++;
        }
        return req;
    }

    async dislike(){
        const req = await this.updateStats('dislikes', this.likes+1);
        if(!req.error){
            this.dislikes++;
        }
        return req;
    }

    async sponsorUntil(date){
        date = new AkaDatetime(date);
        if(!this.id) return Channel.message({code: code.INVALID});
        try{
            await Pdo.prepare("update articles set sponsored_until=:p1 where id=:p2")
                .execute({p1: date.getDateTime(), p2: this.id});
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        return Channel.message({code: code.SUCCESS, error: false});
    }

    hydrate(data){
        this.id = data.id;
        this.title = data.title;
        this.content = data.content;
        this.caption = data.caption;
        this.createdBy = data.created_by;
        this.createdAt = new AkaDatetime(data.created_at).getDateTime();
        this.modifiedAt = new AkaDatetime(data.modified_at).getDateTime();
        this.modifiedBy = data.modified_by;
        this.reading = data.reading;
        this.likes = data.likes;
        this.dislikes = data.dislikes;
        this.category = data.category;
        this.branch = data.branch;
        const postDate = new AkaDatetime(data.post_on);
        this.postOn = postDate.getDateTime();
        this.published = postDate.isLessThan(new AkaDatetime());
        this.sponsoredUntil = !data.sponsored_until ? null : new AkaDatetime(data.sponsored_until).getDateTime();
        return this;
    }

    static async getLast(src = null){
        let article = null,
            queue = "",
            arg = {};
        if(src){
            queue = 'where created_by=:p1 and created_at=:p2';
            arg = {p1: src.createdBy, p2: new AkaDatetime(src.createdAt).getDateTime()};
        }
        try{
            const req = await Pdo.prepare("select * from articles "+queue+" order by id desc LIMIT 1")
                .execute(arg);
            if(req.rowCount){
                article = new Articles().hydrate(req.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return article;
    }

    static async getById(id){
        let article = null;
        try{
            const req = await Pdo.prepare("select * from articles where id=:id")
                .execute({id});
            if(req.rowCount){
                article = new Articles().hydrate(req.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return article;
    }

    static async fetchAll(branch = 0, dataOnly = true, sponsored = false, _public = false){
        let result = [];
        try {
            const req = await Pdo.prepare("select * from articles where branch=:branch order by id desc")
                .execute({branch});
            let data, res;
            while(data = req.fetch()){
                res = new Articles().hydrate(data);
                if(dataOnly){
                    res = await res.data(_public);
                }
                if(
                    !sponsored ||
                    (sponsored && new AkaDatetime(res.sponsoredUntil).isMoreThan(new AkaDatetime()))
                ) {
                    result.push(res);
                }
            }
        }catch(e){
            Channel.logError(e);
        }
        return result;
    }

    static async getSponsored(branch, dataOnly = true, forPublic = false){
        return super.getSponsored(
            Articles,
            'articles',
            set(await Sys.get("sponsoredArticleMinQty"+branch), 5) * 1,
            branch,
            dataOnly,
            forPublic
        );
    }
}

module.exports = Articles;
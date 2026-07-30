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
const {slugNormalizer} = require("../utils/procedures");
const {rand} = require("../utils/procedures");

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
            const req = await Pdo.prepare("select distinct a.*, p.path from articles_pictures a, pictures p where a.article=:id and a.img = p.id")
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
        this.theme = null;
        this.resume = null;
        this.slug = null;
        this.duration = 0;
        this.table = "articles";
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
           'createdBy', 'stats',
           'category', 'branch', 'postOn', 'resume', 'theme', 'duration', 'slug',
            ...(_public ? [] : ['modifiedAt','modifiedBy','published','createdAt','sponsoredUntil'])
        ]);
        const sys_pref = await Sys.getAll(data.branch);
        if(data.caption) {
            data.caption = await (await ArticleImage.getById(data.caption))?.data();
            data.caption = data.caption.path;
        }
        data.stats = await (await this.getStats()).data(_public);
        if(_public){
            if(!sys_pref?.likesVisible ||  (sys_pref.likesVisibleWithCondition && data.stats.likes < sys_pref?.likesVisibilitylimit) ){
                delete data.stats.likes;
            }
            if(!sys_pref?.readingVisible ||  (sys_pref.readingVisibleWithCondition && data.stats.views < sys_pref?.readingVisibilitylimit) ){
                delete data.stats.views;
            }
        }
        if(_public && !sys_pref?.authorVisible){
            delete data.createdBy;
        }
        else {
            data.createdBy = await (await Manager.fetchById(data.createdBy)).data(true, false, true);
        }
        if(!_public) {
            data.modifiedBy = await (await Manager.fetchById(data.modifiedBy)).data(true, false, true);
        }
        data.category = await (await Category.getById(data.category)).data();
        data.category = Filter.object(data.category, ['id', 'name', 'sector']);
        return data;
    }

    async save(){
        // console.log('[This]',this);
        if(!Filter.contains(this, [
            'title','content','createdAt','createdBy','branch', 'postOn','category', 'theme', 'resume', 'duration'
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
                      category,branch,post_on, theme, resume, duration, slug
                    )
                    values(:p1,:p3,:p4,:p5,:p4,:p5,:p6,:p7,:p8, :p9, :p10, :p11, :p12)
                `)
                .execute({
                    p1: this.title,
                    p3: this.content,
                    p4: new AkaDatetime(this.createdAt).getDateTime(),
                    p5: this.createdBy,
                    p6: this.category,
                    p7: this.branch,
                    p8: new AkaDatetime(this.postOn).getDateTime(),
                    p9: this.theme,
                    p10: this.resume,
                    p11: this.duration,
                    p12: await this.createSlug()
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
                        post_on = :p9,
                        theme = :p10,
                        resume = :p11,
                        duration = :p12,
                        slug = :p13
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
                    p9: this.postOn,
                    p10: this.theme,
                    p11: this.resume,
                    p12: this.duration,
                    p13: this.slug
                });
            }
        }catch (e){
            return Channel.logError(e).message({code: code.INTERNAL});
        }
        //We get the ressource list data
        const list = await ArticleImage.fetchAll(article.id);
        let new_pict = [...this.pictures];
        for(let picture of list){
            if(new_pict.indexOf(picture.path) >= 0){
                new_pict = new_pict.filter((e)=> e != picture.path);
            }
        }
        if(new_pict.length) {
            //We update the ressource list
            await ArticleImage.setNew(article.id, article[!this.id ? 'createdBy' : 'modifiedBy'], new_pict);
        }
        if(this.caption && !/^[0-9]+$/.test(this.caption)) {
            let captionId = null;
            for (let img of list) {
                if (img.path === this.caption) {
                    captionId = img.id;
                }
            }
            console.log('[After]', this.pictures, list, this.caption, captionId);
            this.caption = captionId;
            //Then we update the current Caption
            try {
                await Pdo.prepare('update articles set caption=:p1 where id=:p2')
                    .execute({
                        p1: captionId,
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

    static async getReadStats(id){
        const article = await Articles.getById(id);
        console.log("{READ>>>");
        if(article != null) return (await article.data())["reading"];
        return 0;
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
        this.category = data.category;
        this.branch = data.branch;
        this.stats = data.stats;
        this.theme = data.theme;
        this.resume = data.resume;
        this.duration = data.duration;
        this.slug = data.slug;
        const postDate = new AkaDatetime(data.post_on);
        this.postOn = postDate.getDateTime();
        this.published = postDate.isLessThan(new AkaDatetime());
        this.sponsoredUntil = !data.sponsored_until ? null : new AkaDatetime(data.sponsored_until).getDateTime();
        return this;
    }

    static async getLast(src = null, limit = 1, _public = true){
        let article = limit > 1 ? [] : null,
            queue = "",
            arg = {limit};
        if(src){
            queue = 'where created_by=:p1 and created_at=:p2';
            arg = {p1: src.createdBy, p2: new AkaDatetime(src.createdAt).getDateTime(), limit};
        }
        if(_public){
            // queue = (src ? " and" : "where") + " published=1"
        }
        try{
            const req = await Pdo.prepare("select * from articles "+queue+" order by id desc LIMIT :limit")
                .execute(arg);
            if(req.rowCount){
                if(limit == 1) {
                    article = new Articles().hydrate(req.fetch());
                }
                else{
                    let data;
                    while(data = req.fetch()){
                        article.push(new Articles().hydrate(data));
                    }
                }
            }
        }catch(e){
            Channel.logError(e);
        }
        return article;
    }

    static async getCount(){
        try{
            const req = await Pdo.prepare("select count(*) as total from articles").execute();
            if(req.rowCount){
                return req.fetch().total * 1;
            }
        }catch (e) {
            Channel.logError(e);
        }
        return 0;
    }

    static async getThemes(){
        const list = [];
        try{
            const req = await Pdo.prepare("select distinct theme from articles").execute();
            if(req.rowCount){
                let data;
                while(data = req.fetch()){
                    list.push(...(data.theme.split(/ *, */)));
                }
            }
        }catch (e) {
            Channel.logError(e);
        }
        return list;
    }

    async getSimilars(){
        const list = [];
        try{
            const req = await Pdo.prepare(`
                select distinct b.* from articles a, articles b 
                where 
                    a.id = :p1 and
                    a.id != b.id and  (
                        b.category = a.category or LOWER(b.theme) REGEXP CONCAT(
                            '(^|,) *(', REPLACE(LOWER(a.theme), ',', '|'), ') *($|,)'
                        )
                    )
                limit 4
            `).execute({p1: this.id});
            if(req.rowCount){
                let data;
                while(data = req.fetch()){
                    list.push(new Articles().hydrate(data));
                }
            }
        }catch (e) {
            Channel.logError(e);
        }
        return list;
    }

    static async getByThemes(theme){
        return []; //TODO: implements fetching for request by theme
    }

    static async getBySlug(slug){
        let article = null;
        try{
            const req = await Pdo.prepare("select * from articles where slug=:slug")
                .execute({slug});
            if(req.rowCount){
                article = new Articles().hydrate(req.fetch());
            }
        }catch(e){
            Channel.logError(e);
        }
        return article;
    }

    static async slugExists(slug){
        return (await Articles.getBySlug(slug)) != null;
    }

    async createSlug(){
        const baseSlug = slugNormalizer(this.title);
        let slug= baseSlug;
        let existed = false;
        do{
            if(await Articles.slugExists(slug)){
                slug = baseSlug + '-' + rand(10,600);
                existed = true;
            }
            else{
                existed = false;
            }
        }while(existed);
        this.slug = slug;
        return slug;
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
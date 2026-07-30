let {
    Articles,Category,Punchlines,
    Messenging, Manager, Subscriber, Pictures,
    MailingReply, Sys, Branch
} = require('../data/dataPackage');
const code = require('../utils/ResponseCode'),
    Channel = require('../utils/Channel');
const Filter = require("../utils/Filter");
const {is_array,isset,is_file,unlink,toHexa,set} = require('../utils/procedures');
const AkaDatetime = require('../utils/AkaDatetime');
const fs = require('fs');
const {promisify} = require('util');
const defaultQuery = ['cmid', 'bhid','cmtk'];
const privileges = require('../data/Privileges');
const Client = require("../data/Client");

const Wayto = {};

Wayto.startManagement = async () =>{
    if(Manager.list.length > 0){
        return true;
    }
    else {
        console.log('[Man]...',Manager.list.length);
        await Manager.fetchAll();
    }
}

Wayto.unlinkDisconnectedSocket = (socket)=>{
    Manager.searchAndRemoveSocket(socket);
}

Wayto.bindUser = async (data, socket)=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    const manager = await Manager.getById(data.cmid);
    if(!manager){
        return Channel.message({code: code.DENIED_ACCESS});
    }
    manager.attachSocket(socket);
    if(!manager.isAuthentified(data.cmtk)){
        return Channel.message({code: code.LOGOUT});
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS
    })
}

Wayto.connect = async (data)=>{
    if(!Filter.contains(data, ['identifier', 'code'])){
        return Channel.message({code: code.INVALID});
    }
    // console.log('[CHECK]...')
    return await Manager.connect(data.identifier, data.code);
}

Wayto.getAllCategories = async (data, sector='A')=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) return Channel.message({code: code.LOGOUT})
    // console.log('[Look For]',sector);
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await Category.fetchAll(data.bhid, sector)
    });
}

Wayto.getAllWritingData = async (data)=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    return Channel.message({
        error: false,
        code : code.SUCCESS,
        data: {
            categories: await Category.fetchAll(data.bhid, 'A'),
            articles: await Articles.fetchAll(data.bhid)
        }
    });
}

Wayto.articleStats = async function ({artid}){
    const article = await Articles.getById(artid);
    if(article && /\/article\/set\/(views|likes|dislikes)/.test(this.srcUrl)){
        const index = RegExp.$1;
        article.uuid = this.uuid;
        switch (index){
            case "views":
                await article.updateViews();
                break;
            case "likes":
                await article.updateLikes();
                break;
        }
    }
    return Channel.message({
        error: !article,
        code: !article ? code.ERROR : code.SUCCESS,
        data : !article ? null : await (await article.getStats()).data(true)
    });
}

Wayto.readArticle = async (data)=>{
    const article = await Articles.getById(data.artid);
    if(article){
       await article.read();
    }
    return Channel.message({
        error: article == null,
        code: !article ? code.INVALID : code.SUCCESS,
        data: !article ? 0 : article.reading
    });
}

Wayto.articleVisites = async(id)=>{
    const article = await Articles.getById(id);
    if(article){
        await article.updateVisites();
    }
}

Wayto.getArticles = async (data, admin = true)=>{
    // console.log("[CALL ARTICLES>>>", admin)
    if(!Filter.contains(data, admin ? defaultQuery : ['bhid'])){
        return Channel.message({
            error: true,
            code: code.INVALID
        });
    }
    if(admin && !(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    const sponsored = set(data.article, '') === 'sponsored';
    if(!isset(data.artid)){
        return Channel.message({
            error: false,
            code: code.SUCCESS,
            data: await Articles.fetchAll(data.bhid, true, sponsored, !admin)
        });
    }
    const article = await Articles.getById(data.artid);
    if(!article){
        return Channel.message({
            error: true,
            code: code.INVALID
        });
    }
    if(!admin){
        await article.read();
        Manager.broadcast('/article-data-update', await article.data(), data.bhid * 1);
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await article.data(!admin)
    });
}

//public
Wayto.rateArticle = async (id, branch, positive)=>{
    const article = await Articles.getById(id);
    if(!article) return Channel.message({code: code.INVALID});

    if(article.branch != branch) return Channel.message({code: code.BRANCH_ERROR});

    const updating =  await article[positive ? 'like' : 'dislike']();
    if(!updating.error){
        Manager.broadcast('/article-data-update', await article.data(), branch * 1);
    }
    return updating;
}

//public
Wayto.likeArticle = async (data)=>{
    return Wayto.rateArticle(data.like_article, data.bhid, true)
}

//public
Wayto.dislikeArticle = async (data)=>{
    return Wayto.rateArticle(data.dislike_article, data.bhid, false)
}

//public
Wayto.getSiteCategories = async (data)=>{
    if(['articles', 'punchlines'].indexOf(data.sector) < 0){
        return Channel.message({code: code.INVALID});
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await Category.fetchAll(data.bhid, data.sector == 'articles' ? 'A' : 'P', true, true, false)
    });
}

Wayto.getLogo = async (data)=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    try {
        const data = await promisify(fs.readFile)('public/assets/logo.png');
        // console.log('[logo...]',data);
        return Channel.message({
            error: false,
            data
        });
    }catch(e){
        return Channel.logError(e).message({
            code: code.ERROR
        });
    }
}

Wayto.getPunchlines = async (data)=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    return Channel.message({
        error: false,
        code : code.SUCCESS,
        data: {
            punchlines: await Punchlines.fetchAll(data.bhid),
            years: await Punchlines.fetchYears(data.bhid),
            artists: await Punchlines.fetchArtists(data.bhid)
        }
    });
}

Wayto.getPunchline = async (id)=>{
    const punchline = /^[0-9]+$/.test(id) ? await Punchlines.getById(id) : await Punchlines.getBySlug(id);
    return Channel.message({
        error: !punchline,
        code: !punchline ? code.ERROR : code.SUCCESS,
        data : !punchline ? null : {
            punchline: await punchline.data(true)
        }
    });
}
Wayto.punchlineVisites = async(id)=>{
    const punchline = await Punchlines.getById(id);
    if(punchline){
        await punchline.updateVisites();
    }
}

Wayto.punchlineStats = async function ({punchid}){
    const punchline = await Punchlines.getById(punchid);
    if(punchline && /\/punchline\/set\/(views|likes|dislikes)/.test(this.srcUrl)){
        const index = RegExp.$1;
        punchline.uuid = this.uuid;
        switch (index){
            case "views":
                await punchline.updateViews();
            break;
            case "likes":
                await punchline.updateLikes();
            break;
        }
    }
    return Channel.message({
        error: !punchline,
        code: !punchline ? code.ERROR : code.SUCCESS,
        data : !punchline ? null : await (await punchline.getStats()).data(true)
    });
}

Wayto.getPunchlinesPageData = async ()=>{
    return Channel.message({
        error: false,
        code : code.SUCCESS,
        data: {
            punchlines: await Punchlines.fetchAll(1, true, true, false, true),
            years: await Punchlines.fetchYears(1),
            artists: await Punchlines.fetchArtists(1)
        }
    })
}

//public
Wayto.getSitePunchlines = async (data)=>{
    const sponsored = set(data.article, '') === 'sponsored';
    const meta = set(data.meta, false);
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: {
            punchlines: await Punchlines.fetchAll(data.bhid, true, true),
            ...(!meta ? {} : {
                years: await Punchlines.fetchYears(data.bhid),
                artists: await Punchlines.fetchArtists(data.bhid),
                categories: await Category.fetchAll(data.bhid, 'P', true, true, false)
            })
        }
    })
}

//public
Wayto.watchPunchline = async (data)=>{
    const punchline = await Punchlines.getById(data.cardid);
    if(!punchline) return Channel.message({code: code.INVALID});
    await punchline.read();
    return Channel.message({
        error: false,
        code: code.SUCCESS
    });
}

Wayto.getPunchlinesConfig = async (data)=>{
    if(!Filter.contains(data, defaultQuery, [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    // console.log('[Config]',data);
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: {
            cardWidth : set(await Sys.get('cardWidth'+data.bhid), 400) * 1,
            cardHeight : set(await Sys.get('cardHeight'+data.bhid), 400) * 1,
            cardBg : set(await Sys.get('cardBg'+data.bhid), '#000'),
            cardBandBg :  set(await Sys.get('cardBandBg'+data.bhid),'#fff'),
            cardTextColor : set(await Sys.get('cardTextColor'+data.bhid), '#fff'),
            cardBandColor : set(await Sys.get('cardBandColor'+data.bhid),'#000')
        }
    });
}

//public
Wayto.receiveMessage = async (data)=>{
    if(!Filter.contains(data, [
        'cli_fname', 'cli_lname', 'cli_mail', 'cli_msg','cli_bhid', 'cli_subject'
    ])){
        return Channel.message({code: code.INVALID});
    }
    let client = await Subscriber.getByEmail(data.cli_mail),
        saving;
    if(!client){
        client = new Subscriber();
        client.mail = data.cli_mail;
        client.contact = 1;
        client.branch = data.cli_bhid;
        client.createdAt = AkaDatetime.now();
        saving = await client.save();
        if(saving.error){
            return saving;
        }
        client = await Subscriber.getByEmail(client.mail);
    }
    const message = new Messenging();
    message.lastname = data.cli_lname;
    message.firstname = data.cli_fname;
    message.client = client.id;
    message.subject = data.cli_subject;
    message.message = data.cli_msg;
    message.postOn = AkaDatetime.now();
    saving = await message.save();
    if(saving.error){
        return saving;
    }
    Manager.broadcast('/new-contact-message', await saving.data.data(), data.cli_bhid);
    return Channel.message({
        error: false,
        code: code.SUCCESS
    })
}

Wayto.readMessage = async (data, passBy = false) => {
    if(!passBy && !Filter.contains(data, [...defaultQuery, 'msgid'])){
        return Channel.message({code: code.INVALID});
    }
    if(!passBy && !(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(200, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    let result = await Messenging.getById(data.msgid);
    if(result){
        if(!result.readBy){
            result.readBy = data.cmid;
            const saving = await result.save();
            if(saving.error){
                result.readBy = null;
            }
        }
        result = await result.data(false);
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: result
    })
}

Wayto.getAllMessages = async (data)=>{
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(200, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    let result = null;
    if('msgid' in data){
        result = await Wayto.readMessage(data,true);
        result = result.data;
    }
    else{
        result = await Messenging.fetchAll(data.bhid);
    }
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: result
    })
}

Wayto.replyMessage = async (data)=>{
    if(!Filter.contains(data, [
        ...defaultQuery,
        'msgid','subject','message'
    ], [null, 0, ''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    const manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(201, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    let message = await Messenging.getById(data.msgid);
    const reply = new MailingReply();
    reply.client = message.client;
    reply.object = data.subject;
    reply.body = data.message;
    reply.createdAt = AkaDatetime.now();
    reply.postOn = reply.createdAt;
    reply.createdBy = data.cmid;
    reply.message = data.msgid;
    const saving = await reply.save();
    if(saving.error) return saving;
    message = await Messenging.getById(data.msgid);
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await message.data()
    })
}

Wayto.deleteMessage = async (data)=>{
    if(!Filter.contains(data, [
        ...defaultQuery,
        'delid'
    ], [null, 0, ''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    const manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(202, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    let message = await Messenging.getById(data.delid);
    let saving = await message.delete();
    return saving;
}

Wayto.uploadArticleImage = async (data,ths)=>{
    let {upl_artimg = []} = data,
        image = '';
    console.log('[UPL]',data);
    for(let i in upl_artimg){
        if(await ths.isUploaded(upl_artimg[i])){
            if(await ths.isUploaded(upl_artimg[i])) {
                const dest = await Pictures.nextName('A') + '.' + Pictures.extension(upl_artimg[i]);
                image = '/assets/captions/' + dest;
                await ths.move(upl_artimg[i], DIR.PUBLIC+'/assets/captions/', dest);
            }
        }
    }
    return {
        filename: image
    }
}

Wayto.uploadPunchlineImage = async (data,ths)=>{
    let {pch_img = []} = data,
        image = [];
    for(let i in pch_img){
        if(await ths.isUploaded(pch_img[i])){
            const dest = await Pictures.nextName('P') + '.' + Pictures.extension(pch_img[i]);
            image.push('/assets/captions/'+dest);
            await ths.move(pch_img[i], DIR.PUBLIC+'/assets/captions/', dest);
        }
    }
    return{
        filename: image
    };
}

Wayto.uploadMailImage = async (data,ths)=>{
    let {upl_mailimg = []} = data,
        image = '';
    for(let i in upl_mailimg){
        if(await ths.isUploaded(upl_mailimg[i])){
            const dest = toHexa(Pictures.baseName(upl_mailimg[i]))+'.' + Pictures.extension(upl_mailimg[i]);
            image = '/assets/mailing/'+dest;
            await ths.move(upl_mailimg[i], DIR.PUBLIC+'/assets/mailing/', dest);
        }
    }
    return{
        filename: image
    };
}

Wayto.uploadAvatar = async (data,ths)=>{
    let {avatar = []} = data,
        image = '';
    for(let i in avatar){
        if(await ths.isUploaded(avatar[i])){
            const dest = toHexa(Pictures.baseName(avatar[i]))+'.' + Pictures.extension(avatar[i]);
            image = '/assets/avatar/'+dest;
            await ths.move(avatar[i], DIR.PUBLIC+'/assets/avatar/', dest);
        }
    }
    return{
        filename: image
    };
}

Wayto.getPrivileges = async (data)=>{
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }
    const manager = await Manager.getById(data.cmid);
    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: {
            ...privileges,
            own: manager.branches[data.bhid]
        }
    });
}

Wayto.checkIfAvailable = async (data, zone)=>{
    const granted = ['mail', 'nickname'];
    if(granted.indexOf(zone) < 0 || !Filter.contains(data, [...defaultQuery, 'value'])){
        return Channel.message({code: code.INVALID});
    }
    let response = false;
    switch (zone){
        case granted[0]:
            response = await Manager.emailExist(data.value,data.manid);
            break;
        case granted[1]:
            response = await Manager.nicknameExist(data.value,data.manid);
            break;
    }
    return Channel.message({
        code: code.SUCCESS,
        error: false,
        data: !response
    });
}

Wayto.integrateNewManager = async (data)=>{
    if(!Filter.contains(data,[
        ...defaultQuery,
        'firstname', 'lastname', 'nickname', 'email', 'phone', 'auth'
    ], [null, '',0])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(400, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    const auth = await Manager.connect(data.cmid, data.auth);
    if(auth.error) return auth;

    const update = 'id' in data;
    const selfRequest = update && data.id == data.cmid;

    if(update && (
            (!selfRequest && !manager.hasAccess(402, data.bhid)) ||
            (isset(data.privileges) && !manager.hasAccess(407, data.bhid))
        )
    ){
        return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});
    }

    if(!update && (!isset(data.password) || !isset(data.privileges)) ){
        return Channel.message({code: code.INVALID});
    }

    manager = update ? await Manager.getById(data.id) : new Manager();

    if(!manager) return Channel.message({code: code.INVALID});

    if(!update || (update && selfRequest && data.password && data.password.length)){
        manager.code = data.password;
    }
    manager.firstname = data.firstname;
    manager.lastname = data.lastname;
    manager.mail = data.email;
    manager.nickname = data.nickname;
    manager.phone = data.phone;
    if(!update) {
        manager.createdBy = data.cmid;
        manager.createdAt = AkaDatetime.now();
        manager.branches = data.privileges;
        manager.active = true;
    }
    if(isset(data.privileges)){
        for(let branch in data.privileges){
            if(!(await Branch.getById(branch))){
                return Channel.message({code: code.INVALID_BRANCH});
            }
            for(let privilege of data.privileges[branch]){
                if(!(privilege in privileges.privileges)){
                    return Channel.message({code: code.INVALID_PRIVILEGE});
                }
            }
        }
        manager.branches = data.privileges;
    }

    return await manager.save();
}

Wayto.resetManagerPassword = async (data)=>{
    if(!Filter.contains(data, [...defaultQuery, 'psw', 'auth', 'manid'])){
        return Channel.message({code:code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(401, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    const auth = await Manager.connect(data.cmid, data.auth);
    if(auth.error) return auth;

    manager = await Manager.getById(data.manid);

    if(!manager) return Channel.message({code: code.INVALID});

    manager.code = data.psw;

    return await manager.save();
}

Wayto.blockManager = async (data)=>{
    if(!Filter.contains(data, [...defaultQuery, 'block', 'auth', 'manid'])){
        return Channel.message({code:code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let manager = await Manager.getById(data.cmid);
    if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    if(!manager.hasAccess(408, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    const auth = await Manager.connect(data.cmid, data.auth);
    if(auth.error) return auth;

    manager = await Manager.getById(data.manid);

    if(!manager) return Channel.message({code: code.INVALID});

    manager.active = data.block;
    console.log('[ACTIVATE]', manager);
    return await manager.save();
}

Wayto.getAllManagers = async (data)=>{
    // console.log('[Data]',data);
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    return Channel.message({
        code: code.SUCCESS,
        error: false,
        data: await Manager.filter(data.bhid, [data.cmid])
    });
}

Wayto.getManager = async (data)=>{
    if(!Filter.contains(data, [...defaultQuery, 'manid'])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const manager = await Manager.getById(data.manid);

    if(!manager) return Channel.message({code: code.INVALID});

    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: await manager.data()
    });
}

Wayto.setManagerAvatar = async (data)=>{
    if(!Filter.contains(data, [...defaultQuery, 'res'])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const manager = await Manager.getById(data.cmid);

    if(!manager) return Channel.message({code: code.INVALID});

    return await manager.setAvatar(data.res);
}

Wayto.commitCategories = async (data, sector)=>{
    if(!Filter.contains(data, [...defaultQuery, 'save', 'del'])){
        return Channel.message({code:code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    // let manager = await Manager.getById(data.cmid);
    // if(!manager) return Channel.message({code: code.DENIED_ACCESS});
    // if(!manager.hasAccess(408, data.bhid)) return Channel.message({code: code.INSUFFICIENT_PRIVILEGE});

    let message = [],
        save = data.save,
        category, update;
    for(let i in save){
        update = 'id' in save[i];
        category = update ? await Category.getById(save[i].id) : new Category();
        // console.log('[update]',save[i], category);
        if(category) {
            category.name = save[i].name;
            category.id = update ? save[i].id : 0;
            category.sector = sector;
            category.branch = data.bhid;
            if(update){
                category.modifiedAt = new Date();
                category.modifiedBy = data.cmid;
            }
            else{
                category.createdAt = new Date();
                category.createdBy = data.cmid;
            }
            const request = await category.save();
            if(request.error){
                message.push('[ID] ' + save[i].id + ' :: error during operation');
            }
        }
        else{
            message.push('[ID] ' + save[i].id + ' :: invalid');
        }
    }
    save = data.del;
    for(let i in save) {
        category = await Category.getById(save[i]);
        if(category){
            const request = await category.delete();
            if(request.error){
                message.push('[ID] ' + save[i] + ' :: error during operation');
            }
        }
        else{
            message.push('[ID] ' + save[i].id + ' :: invalid');
        }
    }
    return Channel.message({
        error : false,
        code : code.SUCCESS,
        message: message,
        data : await Category.fetchAll(data.bhid, sector)
    });
}

Wayto.commitRedaction = async (data)=>{
    if(!Filter.contains(data, [ ...defaultQuery,
        'title','content', 'img', 'category',
        'schdate', 'theme', 'duration', 'resume'
    ], [undefined])){
        return Channel.message({
            code: code.INVALID
        });
    }
    console.log('[COMMIT>>>', data);
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const update = 'id' in data;
    let article = update ? await Articles.getById(data.id) : new Articles();
    // console.log('[UPDATE]',article);
    const updateSlug = article.title != data.title;
    article.title = data.title;
    article.content = data.content;
    article.category = data.category;
    article.theme = data.theme;
    article.caption = data.caption;
    article.resume = data.resume;
    article.duration = data.duration;
    if(is_array(data.img)){
        article.pictures = data.img;
    }
    if(!article.slug || article.slug.length == 0 || updateSlug){
        await article.createSlug();
    }
    if(!update){
        article.createdAt = new Date();
        article.createdBy = data.cmid;
        article.branch = data.bhid;
    }
    else {
        if(data.bhid !== article.branch){
            return Channel.message({
                code: code.INVALID
            });
        }
        article.modifiedAt = new Date();
        article.modifiedBy = data.cmid;
    }
    if(
        update &&
        isset(data.schdate) && AkaDatetime.isDateTime(data.schdate) &&
        !article.published
    ){
        article.postOn = data.schdate;
    }
    else if(!update){
        article.postOn = new Date();
    }
    let message = await article.save();
    console.log('[Final result]', message);
    return message;
}

Wayto.commitPunchline = async (data)=>{
    if(!Filter.contains(data, [
        ...defaultQuery,
        'title','year','artist', 'category',
        'punchline', 'res'
    ], [null,0,''])){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    const update = 'id' in data;
    const punchline = update ? await Punchlines.getById(data.id) : new Punchlines();
    if(!punchline || !is_array(data.res) || (!update && data.res.length < 2)){
        return Channel.message({code: code.INVALID});
    }
    punchline.title = data.title;
    punchline.artist = data.artist;
    punchline.category = data.category;
    punchline.year = data.year;
    punchline.punchline = data.punchline;
    punchline.lyrics = data.lyrics ? data.lyrics : null;
    punchline.comment = data.comment ? data.comment : null;
    console.log('[Res]',data.res);
    if(data.res.length){
        punchline.card = data.res[0];
        if(data.res[1]){
            punchline.picture = data.res[1];
        }
    }
    punchline[update ? 'modifiedBy' : 'createdBy'] = data.cmid;
    punchline[update ? 'modifiedAt' : 'createdAt'] = new AkaDatetime().getDateTime();
    if(!update){
        punchline.branch = data.bhid;
    }
    if(data.schdate && AkaDatetime.isDateTime(data.schdate) &&
        new AkaDatetime().isLessThan(new AkaDatetime(data.schdate))
    ){
        punchline.postOn = data.schdate;
    }
    if(!update && !punchline.postOn){
        punchline.postOn = new AkaDatetime().getDateTime();
    }
    const saving = await punchline.save();
    if(saving.error){
        //We remove uploaded files
        for(let i in data.res){
            if(await is_file(DIR.PUBLIC+data.res[i])){
                await unlink(DIR.PUBLIC+data.res[i]);
            }
        }
        return saving;
    }
    return Channel.message({
        ...saving,
        data: {
            punchlines: await Punchlines.fetchAll(data.bhid),
            years: await Punchlines.fetchYears(data.bhid),
            artists: await Punchlines.fetchArtists(data.bhid)
        }
    });
}

Wayto.getEssentialsSettings = async (data)=>{
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let response = {};

    response.readingVisible = Boolean(set(await Sys.get('readingVisible'+data.bhid), 0) * 1);
    response.likesVisible = Boolean(set(await Sys.get('likesVisible'+data.bhid), 0) * 1);
    response.authorVisible = Boolean(set(await Sys.get('authorVisible'+data.bhid), 0) * 1);
    response.readingVisibleWithCondition = Boolean(set(await Sys.get('readingVisibleWithCondition'+data.bhid), 0) * 1);;
    response.readingVisibilitylimit = set(await Sys.get('readingVisibilitylimit'+data.bhid), 100) * 1;
    response.likesVisibleWithCondition = Boolean(set(await Sys.get('likesVisibleWithCondition'+data.bhid), 0) * 1);;
    response.likesVisiblitylimit = set(await Sys.get('likesVisiblitylimit'+data.bhid), 100) * 1;
    response = {...response, ...(await Wayto.getPunchlinesConfig(data)).data};
    response.branches = await Branch.fetchAll();
    response.sponsoredArticles = await Articles.getSponsored(data.bhid, true);
    response.sponsoredPunchlines = await Punchlines.fetchAll(data.bhid, true, false, true);

    return Channel.message({
        error: false,
        code: code.SUCCESS,
        data: response
    });
}

Wayto.getSiteSettings = async (bhid, public = true)=>{
    return Channel.message({
        code: code.SUCCESS,
        data: (await Sys.getAll(bhid))?.data(public)
    })
}

Wayto.setEssentialsSettings = async (data)=>{
    if(!Filter.contains(data, defaultQuery)){
        return Channel.message({code: code.INVALID});
    }
    if(!(await Manager.checkAuthentification(data.cmid, data.cmtk))) {
        return Channel.message({code: code.LOGOUT})
    }

    let error = [];
    let handle = (config, result)=>{
        if(result.error){
            error.push({code: result.code, config});
        }
    }
    const manager = await Manager.getById(data.cmid);
    //visibility setup
    if(Filter.contains(data, [
        'readingVisible','likesVisible', 'authorVisible',
        'readingVisibilitylimit', 'likesVisibilitylimit',
        'readingVisibleWithCondition', 'likesVisibleWithCondition'
    ])){
        handle('readingVisible',await Sys.set('readingVisible'+data.bhid, data.readingVisible ? 1 : 0));
        handle('likesVisible',await Sys.set('likesVisible'+data.bhid,data.likesVisible ? 1 : 0));
        handle('authorVisible',await Sys.set('authorVisible'+data.bhid, data.authorVisible ? 1 : 0));
        handle('readingVisibilitylimit',await Sys.set('readingVisibilitylimit'+data.bhid, data.readingVisibilitylimit));
        handle('likesVisibilitylimit',await Sys.set('likesVisibilitylimit'+data.bhid, data.likesVisibilitylimit));
        handle('readingVisibleWithCondition',await Sys.set('readingVisibleWithCondition'+data.bhid, data.readingVisibleWithCondition));
        handle('likesVisibleWithCondition',await Sys.set('likesVisibleWithCondition'+data.bhid, data.likesVisibleWithCondition));
    }

    //punchline default settings
    if(Filter.contains(data, [
        'cardWidth', 'cardHeight','cardBg','cardBandBg','cardTextColor','cardBandColor'
    ])){
        handle('cardWidth',await Sys.set('cardWidth'+data.bhid, data.cardWidth));
        handle('cardHeight',await Sys.set('cardHeight'+data.bhid, data.cardHeight));
        handle('cardBg',await Sys.set('cardBg'+data.bhid, data.cardBg));
        handle('cardBandBg',await Sys.set('cardBandBg'+data.bhid, data.cardBandBg));
        handle('cardTextColor',await Sys.set('cardTextColor'+data.bhid, data.cardTextColor));
        handle('cardBandColor',await Sys.set('cardBandColor'+data.bhid, data.cardBandColor));
    }

    //sponsoring
    let list = ['sponsoredArticles','sponsoredPunchlines'];
    if(Filter.contains(data, list)){
        let sponsor;
        for(let index of list) {
            for (let item of data.sponsoredArticles) {
                sponsor = await (item === list[0] ? Articles : Punchlines).getById(item.id);
                if (sponsor) {
                    handle(item.title,await sponsor.sponsorUntil(item.sponsoredUntil));
                }
            }
        }
    }

    //branch creation/edition
    if(Filter.contains(data, ['branches'])){
        let branch, saving;
        for(let branchData of data.branches){
            branch = branchData.id ? (await Branch.getById(branchData.id)) : new Branch();
            if(branch) {
                branch.name = branchData.name;
                branch.domain = branchData.domain;
                if (!branchData.id) {
                    branch.createdAt = AkaDatetime.now();
                }
                saving = await branch[branchData.delete ? 'delete' : 'save']();
                if(!branchData.delete && !saving.error && !branchData.id){
                    manager.branches[saving.data.id] = manager.branches[data.bhid];
                    handle('assignation', await manager.save());
                }
                handle(branch.name, saving);
            }
            else{
                handle(branchData.name, Channel.message({code: code.BRANCH_ERROR}))
            }
        }
    }

    return Channel.message({
        error: false,
        message: error,
        code: code.SUCCESS,
        data: await Wayto.getEssentialsSettings(Filter.object(data, defaultQuery))
    });
}

Wayto.getHomeSummary = async ()=>{
    const response = {
        lastArticles: [],
        headLines: null,
        lastPunchlines: [],
        totalArticles: 0,
        totalPunchlines: 0
    }
    const articles = await Articles.getLast(null, 4);
    if(articles.length >= 1){
        response.headLines = await articles[0].data(true);
        for(let article of articles.slice(1, articles.length)) {
            response.lastArticles.push(await article.data(true));
        }
    }
    response.lastPunchlines = await Punchlines.getLast(null, 3);
    response.totalArticles = await Articles.getCount();
    response.totalPunchlines = await Punchlines.getCount();

    return Channel.message({
        error: false,
        message: null,
        code: code.SUCCESS,
        data: response
    });
}

Wayto.getArticlesPageData = async()=>{
    return Channel.message({
        error: false,
        message: null,
        code: code.SUCCESS,
        data: {
            totalArticles: await Articles.getCount(),
            themes: await Articles.getThemes(),
            categories: await Category.fetchAll(1, 'A', true, true),
            articles: await Articles.fetchAll(1, true, false, true)
        }
    });
}

Wayto.getReadingPageData = async(slug)=>{
    const article = await Articles.getBySlug(slug);
    const similars = [];
    if(article != null){
        for(const _article of await article.getSimilars()){
            similars.push(await _article.data(true));
        }
    }
    return Channel.message({
        error: article == null,
        message: null,
        code: article == null ? code.ERROR : code.SUCCESS,
        data: article == null ? null : {
            themes: article.theme.split(/ *, */),
            article: await article.data(true),
            similars
        }
    });
}

Wayto.getVisiteStats = async()=>{
    let error = false;
    let data = {};
    try{
        data.lastVisitors = await Client.getCurrentVisitors();
        data.todayVisitors = await Client.getTodayVisitors();
        data.getCumulatedVisites = await Client.getCumulatedVisites();
    }catch (e) {
        Channel.logError("During fetchin :: ", e);
    }
    console.log('[VISITE]', data);
    return Channel.message({
        error,
        code: error ? code.ERROR : code.SUCCESS,
        data
    });
}

module.exports = Wayto;
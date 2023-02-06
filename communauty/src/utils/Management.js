import AkaDatetime from "../utils/AkaDatetime";
import Writing from "../pages/view/Writing";
import Studio from "../pages/view/Studio";
import StudioCreation from "../pages/view/StudioCreation";
import Dashboard from "../pages/view/Dashboard";
import Communauty from "../pages/view/Communauty";
import Messages from "../pages/view/Messages";
import Redactor from "../pages/view/Redactor";
import Category from "../pages/view/Category";
import Main from "../pages/Main";
import ResponseCode from "../utils/ResponseCode";
import ArticlesDraft from "../pages/view/ArticlesDraft";
import Events from "./Events";
import Filter from "../utils/Filter";
import ThunderSpeed from "../utils/thunderspeed";
import Home from "../pages/Home";
import Inbox from "../pages/view/Inbox";
import Integration from "../pages/view/Integration";
import UserInfo from "../pages/view/UserInfo";
import Settings from "../pages/view/Settings";

export default class Management{
    static apis = "http://localhost:7070";
    static server = "http://localhost:3000";
    static storage = null;
    static data = {};
    static calendar = {
        months: ['Jan','Fev','Mars','Avr', 'Mai','Juin', 'Juil','Août', 'Sept', 'Oct','Nov','Déc'],
        days: ['Dimanche','Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    };

    static getRoutes(){
        return {
            "/writing": {
                icon: "feather",
                text: "Redaction",
                view: <Writing/>,
                privilege: 1
            },
            "/writing/new": {
                view: <Redactor/>
            },
            "/studio":{
                icon: "palette",
                text: "Punch studio",
                view: <Studio/>,
                privilege: 100
            },
            "/studio/new": {
                view: <StudioCreation/>
            },
            "/": {
                icon: "home",
                text: "Tableau de bord",
                view: <Dashboard/>
            },
            "/communauty": {
                icon: "users",
                text: "Communauté",
                view: <Communauty/>
            },
            "/messenging":{
                icon: "mail-bulk",
                text: "Messagerie",
                view: <Messages/>,
                privilege: 200
            },
            "/messenging/read":{
                view: <Inbox/>
            },
            "/studio/category":{
                view: <Category/>
            },
            "/writing/category":{
                view: <Category/>
            },
            "/writing/draft":{
                view: <ArticlesDraft/>
            },
            "/communauty/integration": {
                view: <Integration/>
            },
            "/communauty/usr": {
                view: <UserInfo/>
            },
            "/usr": {view: <UserInfo/>},
            "/settings": {view: <Settings/>}
        };
    }

    static getProjectName(){
        return "Mus au top"
    }

    static getDateString(val, long = true){
        var date = new AkaDatetime(val),
            calendar = Management.calendar,
            now = new AkaDatetime();
        var diff = AkaDatetime.diff(now, date),
            hour = (date.getHour() == 0 ? "minuit " : date.getHour()+'h ')+(date.getMinute() == 0 ? 'pile' : date.getMinute());
        if(diff.getDay() == 0 && diff.getMonth() == 1 && diff.getYear() == 0){
            if(diff.getHour() == 0){
                if(diff.getMinute() <= 1){
                    return (long ? "À " : '')+"l'instant";
                }
                else{
                    return (long ? "Il y a " : '')+diff.getMinute()+' min.'
                }
            }
            else if(date.getDay() - now.getDay() == 0){
                return "Aujourd'hui à "+hour;
            }
            else{
                return "Demain à "+hour
            }
        }
        else if(diff.getDay() == 1 && date.getDay() - now.getDay() == 1 && diff.getMonth() == 1 && diff.getYear() == 0){
            return "Demain à "+hour
        }
        return (long ? calendar.days[date.getWeekDay()] : '')+' '+date.getDay()+' '+calendar.months[date.getMonth() * 1 - 1]+' '+date.getFullYear()+(long ? ' à '+ hour : '');
    }

    static async replaceData(source, data, criteria){
        let index = -1;
        if(!Array.isArray(source)){
            source[criteria] = data;
            return source;
        }
        for(let i in source){
            if(source[i][criteria] == data[criteria]){
                index = i * 1;
                break;
            }
        }
        if(index >= 0) {
            console.log('[...update]')
            source[index] = data;
        }
        else{
            console.log('[...insert]')
            let last = data;
            if(source.length > 1){
                let tmp;
                for(let i = 1; i < source.length; i++){
                    tmp = source[i];
                    source[i] = last;
                    last = tmp;
                }
            }
            source.push(last);
        }
        console.log('[replace]',index,data);
        await Management.commit();
    }

    static removeData(source, value, criteria){
        if(!Array.isArray(source)){
            delete source[criteria];
            return source;
        }
        source = source.filter(e=>{
            if(e[criteria] != value){
                return e[criteria];
            }
        });

        return source;
    }

    static async connect(username, password){
        return new Promise((res,rej)=>{
            fetch(Management.apis+"/connect",{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    identifier: username,
                    code: password
                })
            })
            .then((response)=> response.json())
            .then(async (result)=>{
                console.log('[Result]', result);
                if(result.error){
                    rej(Management.readCode(result.code));
                    return;
                }
                await Home.openStorage();
                Management.storage.setItem("agent", result.data)
                .then(()=>{
                    res(result);
                })
            }).catch((err)=>{
                // console.log('[Error]',err);
                rej(/^[0-9]+$/.test(err) ? Management.readCode(err) : "Une erreur est survénue lors de l'opération !");
            })
        });
    }

    static watch(){
        Main.socket
        .on('/session-expiration', ()=>{
            Events.emit("logout-requirement");
        })
        .on('/user-update', async (data)=>{
            if(Management.data.id == data.id) {
                await Management.updateSelf(data);
                Events.emit("personal-data-updated");
            }
            else{
               Management.setStorage('managers', [], 0);
               await Management.replaceData(Management.data.managers, data, 'id');
               Events.emit("manager-list-update");
            }
        })
        .on('/new-contact-message', async (data)=>{
            Management.setStorage('messages', []);
            await Management.replaceData(Management.data.messages[Main.branch], data, 'id');
            Events.emit("new-contact-message");
        })
        .on('/article-data-update', async (data)=>{
            Management.setStorage('articles', []);
            await Management.replaceData(Management.data.articles[Main.branch], data, 'id');
            Events.emit("article-data-update")
        })
        return Management;
    }

    static async bind(){
        return await Management.request(
            '/connect',
            Management.defaultQuery(),
            '/connect/report'
        );
    }

    static async afterReady(){
        return new Promise((res)=>{
           if(Main.socket.connected){
               return res();
           }
           const timer = setInterval(()=>{
               // console.log('[connected][test]',Main.socket.connected);
               if(Main.socket.connected){
                   return clearInterval(timer);
               }
               console.log('[Retry] ... 5 seconds');
               Main.retryConnection();
           },5000);
           Events.on('connected', ()=>{
               clearInterval(timer);
               res();
           });
        });
    }

    static async request(emitSrc, data = null, listenSrc){
        return new Promise(async (res,rej)=>{
           await Management.afterReady();
           Main.socket
           .emit(emitSrc, data)
           .on(listenSrc, (data)=>{
               if(!data){
                   return rej(Management.readCode(0));
               }
               if(data.error){
                   return rej(data.message != null ? data.message : Management.readCode(data.code));
               }
               res(data);
           })
        });
    }

    static setStorage(index, defaultValue, branch = null){
        branch = branch || branch === 0 ? branch : Main.branch;
        if(!(index in  Management.data)){
            Management.data[index] = branch === 0 ? [] :{};
        }
        if(branch && !(branch in Management.data[index])){
            Management.data[index][branch] = defaultValue;
        }
        return Management;
    }

    static getStorage(index, branch){
        branch = branch ? branch : Main.branch;
        if(index in Management.data && branch in Management.data[index]){
            return Management.data[index][branch];
        }
        return null;
    }

    static setCategoriesStorage(branch = null){
        Management.setStorage('categories', {
            writing: [],
            punchlines: []
        },branch);
        return Management;
    }

    static setPunchlinesStorage(branch = null){
        Management.setStorage('punchlines', {
            data: [],
            artists: [],
            years: []
        },branch);
        return Management;
    }

    static setArticlesStorage(branch = null){
        Management.setStorage('articles', [],branch);
        return Management;
    }

    static defaultQuery(){
        const options = {
            cmid: Management.data.id,
            bhid: Main.branch,
            cmtk: Management.data.token
        }
        console.log('[def]',options, Management.data);
        return options;
    }

    static readCode(code){
        switch (code){
            case ResponseCode.SUCCESS:
                return "La requête a été exécutée avec succès !";
                break
            case ResponseCode.INVALID:
                return "Vous n'avez pas fourni assez de donnée pour cette opération. Veuillez vérifier vos données.";
                break;
            case ResponseCode.INTERNAL:
                return "Une erreur interne s'est produite lors de l'opération. Veuillez contacter le service webmastering.";
                break;
            case ResponseCode.ERROR:
                return "Un erreur non identifiée s'est produite !";
                break;
            case ResponseCode.LOGOUT:
                Events.emit("logout-requirement");
                return "Vous allez être déconnecté(e)";
            case ResponseCode.BRANCH_ERROR:
                return "Un problème de filiale se pose lors de l'opération";
            case ResponseCode.AUTHENTICATION_ERROR:
                return "Votre requête n'a pa pu être authentifiée";
            case ResponseCode.PICTURE_UPDATE_ERROR:
                return "Une erreur s'est produite lors du chargement d'image";
            case ResponseCode.DENIED_ACCESS:
                return "Ce compte n'a plus accès aux ressources de l'administration. Contactez l'administration pour demander de l'aide.";
            case ResponseCode.INSUFFICIENT_PRIVILEGE:
                return "Vous n'avez pas assez de privilège pour exécuter cette opération";
            default:
                return "Erreur inconnue ! [code] 0x"+code;
                break;
        }
    }

    static isGranted(privilege, any = false){
        privilege = Array.isArray(privilege) ? privilege : [privilege];
        const branch = Main.branch,
              list = Management.data.branches[branch];
        if(any) {
            for (let access of list) {
                if(privilege.indexOf(access * 1) >= 0){
                    return true;
                }
            }
        }
        else{
            let found = 0;
            for(let number of privilege){
                for (let access of list) {
                    if(access == number){
                        found++;
                    }
                }
            }
            return found == privilege.length;
        }
        return false;
    }

    static async commit(){
        try {
            await Home.openStorage();
            if(Management.storage){
                await Management.storage.setItem('agent', JSON.stringify(Management.data));
                return false;
            }
            await (async()=>{
                Events.on('storage-open', async ()=>{
                    await Management.storage.setItem('agent', JSON.stringify(Management.data));
                });
            })();
        }catch (e) {
            console.error('[Error]',e, Management.storage);
        }
    }

    static async retrieve(){
        try{
            await Home.openStorage();
            let data = await Management.storage.getItem('agent');
            if(typeof data === 'string') {
                data = JSON.parse(data);
            }
            Management.data = data;
            return data;
        }catch(e){
            console.error('[Error]',e);
        }
        return {};
    }

    static async getWritingDatas(){
        let branch = Main.branch;
        Management.setCategoriesStorage();
        if('categories' in Management.data){
            if(
                'writing' in Management.data.categories[branch] &&
                Management.data.categories[branch].length
            ){
                return Management.data.categories[branch].writing;
            }
        }
        await Management.afterReady();
        const data = await Management.request(
            '/writing',
            Management.defaultQuery(),
            '/writing/data'
        );
        Management.setCategoriesStorage(branch)
            .getStorage('categories')
            .writing = data.data.categories;
        Management.setArticlesStorage(branch);
        Management.data.articles[branch] = data.data.articles;
        await Management.commit();
        return data.data;
    }

    static async getCategory(sector){
        return new Promise(async (res,rej)=>{
            await Management.afterReady();
            Main.socket
            .emit("/"+sector+"/category/fetch", {
                ...Management.defaultQuery(),
                sector: sector == 'writing' ? 'A' : 'P'
            })
            .once("/"+sector+"/category/get", async(data)=>{
                if(data.error){
                   return rej(Management.readCode(data.code));
                }
                console.log('[Cat..]',data);
                await Management.commit();
                res(data.data);
            });
        })
    }

    static getCategoryName(sector,id){
        let name = null;
        if(['writing','punchlines'].indexOf(sector) < 0) return name;
        //we defined category storage if not exists;
        let list = Management.setCategoriesStorage().getStorage('categories')[sector];
        for(let i in list){
            if(list[i].id == id){
                name = list[i].name;
            }
        }
        return name;
    }

    static async getArticlesCategory(){
        return await Management.getCategory('writing');
    }

    static async getPunchlinesCategory(){
        return await Management.getCategory('punchlines');
    }

    static async addDraft(data){
        Management.setStorage('draft', []);
        if('index' in data){
            Management.data.draft[Main.branch][data.index] = data;
        }
        else {
            data.index = Management.getStorage('draft').length;
            Management.data.draft[Main.branch].push(data);
        }
        await Management.commit();
    }

    static removeDraft(index){
        Management.setStorage('draft', []);
        const r = [];
        let item;
        for(let i in Management.data.draft[Main.branch]){
            if(i != index){
                item = Management.data.draft[Main.branch][i];
                item.index = i;
                r.push(item);
            }
        }
        Management.data.draft[Main.branch] = r;
        Management.commit();
    }

    static getDraft(index = null){
        Management.setStorage('draft',[]);
        if(index === null){
            return Management.data.draft[Main.branch];
        }
        else{
            return index in Management.data.draft[Main.branch] ? Management.data.draft[Main.branch][index] : null;
        }
    }

    static async getArticle(id = null){
        let article = null;
        let branch = Main.branch;
        Management.setStorage('articles', []);
        await Management.commit();
        if(!id && Management.data.articles[branch].length){
            return Management.data.articles[branch];
        }
        if(id) {
            for (let i in Management.data.articles[branch]) {
                if (Management.data.articles[branch][i].id === id) {
                    article = Management.data.articles[branch][i];
                    break;
                }
            }
            if (article) {
                return article;
            }
        }
        const data = await Management.request(
            '/articles',{
                ...Management.defaultQuery(),
                artid: id
            },
            '/articles/get'
        );
        if(data.error){
            return article;
        }
        if(id){
            await Management.replaceData(Management.data.articles[branch], data.data, 'id');
        }
        else{
            Management.data.articles[branch] = data.data;
        }
        return data.data;
    }

    static async getLogo(){
        try {
            const data = await Management.request('/logo/fetch', Management.defaultQuery(), '/logo/get');
            if (!data.error) {
                data.data = new Blob([data.data]);
            }
            return data;
        }catch(err){
            throw err;
        }
    }

    static async getMessages(id=null){
        Management.setStorage('messages', []);
        let branch = Main.branch;
        const read = async ()=>{
            const args = Management.defaultQuery();
            if(id){
                args.msgid = id;
            }
            const data = await Management.request('/messages/fetch', args, '/messages/get');
            if(id){
                await Management.replaceData(Management.data.messages[branch], data.data, 'id');
            }
            else {
                Management.data.messages[branch] = data.data;
            }
            await Management.commit();
            return data;
        }
        if(Management.data.messages[branch].length){
            if(!id) return Management.data.messages[branch];
            for(let i in Management.data.messages[branch]){
                if(Management.data.messages[branch][i].id == id){
                    if(!Management.data.messages[branch][i].readBy){
                        const data = await read();
                        return data.data;
                    }
                    return Management.data.messages[branch][i];
                }
            }
        }
        const data = await read();
        if(!id) return data.data;
        for(let i in Management.data.messages[branch]){
            if(Management.data.messages[branch][i].id == id){
                return Management.data.messages[branch][i];
            }
        }
        return null;
    }

    static async getPunchlinesConfig(){
        const data = await Management.request(
            '/punchlines/config/fetch',
            Management.defaultQuery(),
            '/punchlines/config/get'
        );
        return data.data;
    }

    static async getPunchlinesData(id = null){
        let branch = Main.branch;
        let source = Management.setPunchlinesStorage().data.punchlines[branch];
        if(id){
            for(let i in source.data){
                if(source.data[i].id == id){
                    return source.data[i];
                }
            }
        }
        else if(source.data.length){
            return source;
        }
        const data = await Management.request('/punchlines/fetch', Management.defaultQuery(), '/punchlines/get');
        source = data.data;
        Management.setPunchlinesStorage(branch)
            .data.punchlines[branch].data = data.data.punchlines;
        Management.data.punchlines[branch].years = data.data.years;
        Management.data.punchlines[branch].artists = data.data.artists;
        await Management.commit();
        if(id){
            source = Management.data.punchlines[branch];
            for(let i in source.data){
                if(source.data[i].id == id){
                    return source.data[i];
                }
            }
            return null;
        }
        return Management.data.punchlines[branch];
    }

    static async commitRedaction(data){
        return new Promise((res,rej)=>{
            let branch = Main.branch;
            Main.socket
            .emit("/writing/write", data)
            .once('/writing/write/response', async (data)=>{
                if(data.error){
                    return rej(Management.readCode(data.code));
                }
                Management.setArticlesStorage(branch)
                .data.articles[branch] = data.data;
                await Management.commit();
                res(data);
            })
        })
    }

    static async commitCategory(data,sector){
        return new Promise((res,rej)=>{
            if(['punchlines', 'writing'].indexOf(sector) < 0){
                return rej("unrecognized sector given !");
            }
            let branch = Main.branch;
            Main.socket
            .emit('/'+sector+'/category/set', data)
            .once('/'+sector+'/category/get', async (data)=>{
                if(data.error){
                    return rej(Management.readCode(data.code));
                }
                Management.setCategoriesStorage(branch);
                Management.data.categories[branch][sector] = data.data;
                await Management.commit();
                res(data);
            })
        });
    }

    static async commitPunchline(data,feeback = null){
        return new Promise((res,rej)=>{
            const ths = new ThunderSpeed();
            const query = {
                ...Management.defaultQuery(),
                ...Filter.object(data,[
                    'title','year','artist','category','punchline',
                    'lyrics','comment'
                ])
            }
            if(data.id){
                query.id = data.id;
            }
            data.card.name = 'punchline.png';
            ths.setFile(data.card);
            if(data.image){
                ths.setFile(data.image)
            }
            let branch = Main.branch;
            ths.on('progress', (progress)=>{
                if(feeback){
                    const currentProcess = (progress.file.name === data.card.name ?
                        'Téléversement du punchline card' :
                            data.image && progress.percent < 100 ?
                                "Téléversement de l'image de fond" : "Sauvegarde des informations"
                    );
                    feeback({
                        currentProcess,
                        progress: progress.percent
                    });
                }
            });
            ths.params({
                url: Management.apis+'/upl_img',
                fileIndexName: 'upl_pch',
                uploadedFileIndexName: 'pch_img'
            })
            .start().then(async (data)=>{
                try{
                    const result = await Management.request(
                        '/punchlines/create',
                        {
                            ...query,
                            res: data.filename
                        },
                        '/punchlines/get');
                    Management.setPunchlinesStorage(branch)
                    .data.punchlines[branch].data = result.data.punchlines;
                    Management.data.punchlines[branch].years = result.data.years;
                    Management.data.punchlines[branch].artists = result.data.artists;
                    await Management.commit();
                    res(result);
                }catch (message){
                    rej(message);
                }
            }).catch((message)=>{
                rej(message);
            });
        })
    }

    static async sendMessageReply(data){
        let branch = Main.branch;
        Management.setStorage('messages', []);
        const response = await Management.request('/message/reply', {
            ...Management.defaultQuery(),
            ...data
        }, '/message/get');
        await Management.replaceData(Management.data.messages[branch], response.data, 'id');
        return response.data;
    }

    static async deleteMessage(data){
        let branch = Main.branch;
        Management.setStorage('messages', []);
        const response = await Management.request('/message/delete', {
            ...Management.defaultQuery(),
            ...data
        }, '/message/remove');
        Management.data.messages[branch] = Management.removeData(Management.data.messages[branch], data.delid, 'id');
        await Management.commit();
        return response.data;
    }

    static async fetchPrivilegies(){
        const data = await Management.request('/privilegies/fetch', Management.defaultQuery(),'/privilegies/get');
        return data.data;
    }

    static async checkForAvailability(data, value, uid = null){
        uid = uid ? {manid: uid} : {};
        try{
            const result = await Management.request(`/manager/${data}/check`, {
                value: value,
                ...Management.defaultQuery(),
                ...uid
            }, `/manager/${data}/is`);
            return result.data;
        }catch (e) {
            console.log('[Err]',e);
            return false;
        }
    }

    static async checkForNickNameAvailability(nickname, id = null){
        return await Management.checkForAvailability('nickname', nickname, id);
    }

    static async checkForEmailAvailability(email, id = null){
        return await Management.checkForAvailability('email', email, id);
    }

    static async updateSelf(data){
        for(let i in data){
            Management.data[i] = data[i];
        }
        await Management.commit();
    }

    static getMemberOnBranch(item = null){
        const branch = Main.branch;
        if(item){
            return branch in item.branches ? item : null;
        }
        const list = [];
        for(let i in Management.data.managers){
            if(branch in Management.data.managers[i].branches){
                list.push(Management.data.managers[i]);
            }
        }
        return list;
    }

    static async integrateNewManager(query){
        let branch = Main.branch;
         const data = await Management.request(
             '/manager/integration',
             {...Management.defaultQuery(), ...query},
             '/manager/approval'
         );
         console.log('[Integration]',data, [...Management.data.managers]);
         if(data.data.id == Management.data.id){
             await Management.updateSelf(data.data);
         }
         else {
             Management.setStorage('managers', [], 0);
             await Management.replaceData(Management.data.managers, data.data, 'id');
         }
         return Management.getMemberOnBranch(data.data);
    }

    static async changePassword(query){
        const data = await Management.request(
            '/manager/reset',
            {...query, ...Management.defaultQuery()},
            '/manager/get'
        );
        Management.setStorage('managers', [], 0);
        await Management.replaceData(Management.data.managers, data.data, 'id');
        return Management.getMemberOnBranch();
    }

    static async blockManager(query){
        const data = await Management.request(
            '/manager/block',
            {...query, ...Management.defaultQuery()},
            '/manager/get'
        );
        Management.setStorage('managers', [],0);
        await Management.replaceData(Management.data.managers, data.data, 'id');
        return Management.getMemberOnBranch();
    }

    static async getAllMembers(){
        const data = await Management.request(
            '/management/list',
            Management.defaultQuery(),
            '/management/get'
        );
        console.log('[Manager]',data);
        Management.setStorage('managers', [], 0);
        for(let i in data.data){
            await Management.replaceData(Management.data.managers, data.data[i],'id');
        }
        return Management.getMemberOnBranch();
    }

    static async getMemberData(id){
        const defaultQuery = Management.defaultQuery();
        const data = await Management.request(
            '/management/member',{
                ...defaultQuery,
                manid: id
            },
            '/management/get'
        );
        Management.setStorage('managers', [], 0);
        await Management.replaceData(Management.data.managers, data.data, 'id');
        return Management.getMemberOnBranch(data.data);
    }

    static async setProfile(avatar, feeback = null){
        return new Promise((res,rej)=>{
            const ths = new ThunderSpeed();
            ths.setFile(avatar);
            ths.on('progress', (progress)=>{
                if(feeback){
                    feeback(progress.percent);
                }
            });
            ths.params({
                url: Management.apis+'/upl_img',
                fileIndexName: 'upl_avt',
                uploadedFileIndexName: 'avatar'
            })
            .start().then(async (data)=>{
                if(feeback){
                    feeback(0);
                }
                const result = await Management.request(
                    '/manager/avatar/set',
                    {
                        ...Management.defaultQuery(),
                        res: data.filename
                     },
                    '/manager/get'
                );
                await Management.updateSelf(data.data);
                res(result.data);
            }).catch((message)=>{
                rej(message);
            });
        })
    }

    static async getEssentials(){
        const data = await Management.request(
            '/cog/essentials',
            Management.defaultQuery(),
            '/cog/get'
        );
        return data.data;
    }

    static async setEssentials(query){
        const data = await Management.request(
            '/cog/essentials/set',
            {...query, ...Management.defaultQuery()},
            '/cog/get'
        );
        return data;
    }
}
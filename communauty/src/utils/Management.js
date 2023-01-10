import Ressources from "./Ressources";
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

export default class Management{
    static storage = null;
    static data = {}    ;

    static getRoutes(){
        return {
            "/writing": {
                icon: "feather",
                text: "Redaction",
                view: <Writing/>
            },
            "/writing/new": {
                view: <Redactor/>
            },
            "/studio":{
                icon: "palette",
                text: "Punch studio",
                view: <Studio/>
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
                view: <Messages/>
            },
            "/studio/category":{
                view: <Category/>
            },
            "/writing/category":{
                view: <Category/>
            },
            "/writing/draft":{
                view: <ArticlesDraft/>
            }
        };
    }

    static getProjectName(){
        return "Mus au top"
    }

    static async connect(username, password){
        return new Promise((res,rej)=>{
            fetch(Ressources.apis+"/connect",{
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
            .then((result)=>{
                // console.log('[Result]', result);
                if(result.error){
                    rej(result.message);
                    return;
                }
                Management.storage.setItem("agent", result.data)
                .then(()=>{
                    res(result);
                })
            }).catch((err)=>{
                // console.log('[Error]',err);
                rej("Une erreur est survénue lors de l'opération !");
            })
        });
    }

    static async afterReady(){
        return new Promise((res)=>{
           if(Main.socket.connected){
               return res();
           }
           const timer = setInterval(()=>{
               if(Main.socket.connected){
                   return clearInterval(timer);
               }
               console.log('[Retry] ... 5 seconds');
               Main.retyConnection();
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
               if(data.error){
                   return rej(Management.readCode(data.code));
               }
               res(data);
           })
        });
    }

    static setStorage(index, defaultValue){
        if(!(index in  Management.data)){
            Management.data[index] = defaultValue;
        }
        return Management;
    }

    static setCategoriesStorage(){
        Management.setStorage('categories', {
            writing: [],
            punchlines: []
        });
        return Management;
    }

    static setPunchlinesStorage(){
        Management.setStorage('punchlines', []);
        return Management;
    }

    static setArticlesStorage(){
        Management.setStorage('articles', []);
        return Management;
    }

    static defaultQuery(){
        return {
            cmid: Management.data.id,
            bhid: Main.branch,
            cmtk: Management.data.token
        }
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
                return "Vous allez être déconnecté(e)";
                break;
            case ResponseCode.BRANCH_ERROR:
                return "Un problème de filiale se pose lors de l'opération";
            default:
                return "Erreur inconnue !";
                break;
        }
    }

    static async commit(){
        try {
            await Management.storage.setItem('agent', JSON.stringify(Management.data));
        }catch (e) {
            console.error('[Error]',e, Management.storage);
        }
    }

    static async retrieve(){
        try{
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
        return new Promise(async (res)=>{
            if('categories' in Management.data){
                if('writing' in Management.data.categories && Management.data.categories.length){
                    return res(Management.data.categories.writing);
                }
            }
            await Management.afterReady();
            Main.socket
            .emit("/writing", Management.defaultQuery())
            .on("/writing/data", async(e)=>{
                const data = e.data;
                Management.setCategoriesStorage()
                .data.categories.writing = data.categories;
                Management.data.articles = data.articles;
                await Management.commit();
                res(data);
            });
        });
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
                await Management.commit();
                res(data.data);
            });
        })
    }

    static getCategoryName(sector,id){
        let name = null;
        if(['writing','punchlines'].indexOf(sector) < 0) return name;
        //we defined category storage if not exists;
        Management.setCategoriesStorage();
        let list = Management.data.categories[sector];
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
        if(!('draft' in Management.data)){
            Management.data.draft = [];
        }
        if('index' in data){
            Management.data.draft[data.index] = data;
        }
        else {
            data.index = Management.data.draft.length;
            Management.data.draft.push(data);
        }
        await Management.commit();
    }

    static removeDraft(index){
        if(!('draft' in Management.data)){
            Management.data.draft = [];
        }
        const r = [];
        let item;
        for(let i in Management.data.draft){
            if(i != index){
                item = Management.data.draft[i];
                item.index = i;
                r.push(item);
            }
        }
        Management.data.draft = r;
    }

    static getDraft(index = null){
        if(!('draft' in Management.data)){
            Management.data.draft = [];
        }
        if(index === null){
            return Management.data.draft;
        }
        else{
            return index in Management.data.draft ? Management.data.draft[index] : null;
        }
    }

    static async getArticle(id){
        return new Promise(async (res,rej)=>{
            let article = null;

            if(!('articles' in  Management.data)){
                Management.data.articles = [];
                await Management.commit();
            }
            for(let i in Management.data.articles){
                if(Management.data.articles[i].id === id){
                    article = Management.data.articles[i];
                    break;
                }
            }
            if(article){
                return res(article);
            }
            await Management.afterReady();
            Main.socket.emit('/articles', {
                ...Management.defaultQuery(),
                artid: id
            }).once('/articles/get', async(data)=>{
                if(data.error){
                    return res(article);
                }
                Management.data.articles.push(data.data);
                res(data.data);
            });
        })
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

    static async commitRedaction(data){
        return new Promise((res,rej)=>{
            Main.socket
            .emit("/writing/write", data)
            .once('/writing/write/response', async (data)=>{
                if(data.error){
                    return rej(Management.readCode(data.code));
                }
                Management.setArticlesStorage()
                .data.articles = data.data;
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
            Main.socket
            .emit('/'+sector+'/category/set', data)
            .once('/'+sector+'/category/get', async (data)=>{
                if(data.error){
                    return rej(Management.readCode(data.code));
                }
                Management.data.categories[sector] = data.data;
                await Management.commit();
                res(data);
            })
        });
    }

    static async commitPunchline(data,feeback = null){
        console.log('[commit]');
        return new Promise((res,rej)=>{
            const ths = new ThunderSpeed();
            const query = {
                ...Management.defaultQuery(),
                ...Filter.object(data,[
                    'title','year','artist','category','punchline',
                    'lyrics','comment'
                ])
            }
            data.card.name = 'punchline.png';
            ths.setFile(data.card);
            if(data.image){
                ths.setFile(data.image)
            }
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
                url: Ressources.apis+'/upl_img',
                fileIndexName: 'upl_pch',
                uploadedFileIndexName: 'pch_img'
            })
            .start().then(async (data)=>{
                console.log('[End]',data, query);
                try{
                    const result = await Management.request('/punchlines/create', {
                        ...query,
                        res: data.filename
                    }, '/punchlines/get');
                    Management.setPunchlinesStorage()
                    .data.punchlines = result.data;
                    await Management.commit();
                    res(result);
                }catch (message){
                    rej(message);
                }
            }).catch((message)=>{
                rej(message);
            });
            console.log('[Ths]',ths, ths.files());
        })
    }
}
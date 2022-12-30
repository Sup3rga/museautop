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

export default class Management{
    static storage = null;
    static data = null;

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
            }
        };
    }

    static getProjectName(){
        return "Muse au top"
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

    static setCategoriesStorage(){
        if(!('categories' in Management.data)){
            Management.data.categories = {
                writing: [],
                punchlines: []
            }
        }
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

    static async getWritingDatas(){
        return new Promise((res)=>{
            if('categories' in Management.data){
                if('writing' in Management.data.categories){
                    return res(Management.data.categories.writing);
                }
            }
            Main.socket
                .emit("/writing", Management.defaultQuery())
                .on("/writing/data", (e)=>{
                    const data = e.data;
                    Management.setCategoriesStorage()
                        .data.categories.writing = data.categories;
                    Management.data.articles = data.articles;
                    res(data);
                });
        });
    }

    static async getCategory(sector){
        return new Promise((res,rej)=>{
            Main.socket
            .emit("/"+sector+"/category/fetch", {
                ...Management.defaultQuery(),
                sector: sector == 'writing' ? 'A' : 'P'
            })
            .once("/"+sector+"/category/get", (data)=>{
                if(data.error){
                   return rej(Management.readCode(data.code));
                }
                res(data.data);
            });
        })
    }

    static async getArticlesCategory(){
        return await Management.getCategory('writing');
    }

    static async getPunchlinesCategory(){
        return await Management.getCategory('punchline');
    }
}
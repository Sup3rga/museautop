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
}
import React from 'react';
import Login from "./Login";
import Events from "../utils/Events";
import Management from "../utils/Management";
import Main from "./Main";
import localforage from "localforage";
import Ressources from "../utils/Ressources";

export default class Home extends React.Component{

    constructor(props) {
        super(props);
        this.state = null
        this.mounted = false;
        Home.openStorage();
    }

    static async openStorage(){
        if(Management.storage){
           return;
        }
        localforage.config({
            driver      : localforage.INDEXEDDB,
            name        : Ressources.getProjectName(),
            version     : 1.0,
            storeName   : Ressources.getProjectName().replace(' ','_')+'DataBase',
            description : 'for storage'
        });
        Management.storage = localforage;
        await localforage.ready()
        Events.emit("storage-open");
    }

    async setView(){
        const r = await Management.retrieve();
        console.log('[R]',r);
        this.setState(state => !r ?  <Login/> : <Main/>);
    }

    componentDidMount() {
        this.mounted = true;
        this.setView();
        Events.on('reset-view', ()=>{
            this.setView();
        },this)
    }

    componentWillUnmount() {
        this.mounted = false;
        console.log('[unmounted]');
    }

    render() {
        return this.state;
    }
}
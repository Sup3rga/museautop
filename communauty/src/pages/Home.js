import React from 'react';
import Login from "./Login";
import localforage from "localforage";
import Events from "../utils/Events";
import Management from "../utils/Management";
import Main from "./Main";

export default class Home extends React.Component{

    constructor(props) {
        super(props);
        this.state = null
    }

    setView(){
        Management.storage.getItem("agent").then(r => {
            console.log('[R]',r);
            Management.data = r;
            this.setState(state => !r ? <Login/> : <Main/>)
        }).catch(()=>{
            this.setState(<div>Error 404</div>)
        })
    }

    componentDidMount() {
        this.setView();
        Events.on('reset-view', ()=>{
            console.log('[Reset]');
            this.setView();
        })
    }

    render() {
        return this.state;
    }
}
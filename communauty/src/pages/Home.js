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
        this.mounted = false;
    }

    async setView(){
        const r = await Management.retrieve();
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
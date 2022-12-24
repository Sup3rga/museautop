import React from 'react';
import Url from "./Url";
import Events from "./Events";
import Drawer from '../components/Menu';

export default class Route extends React.Component{
    static _routes = {};
    constructor(props) {
        super(props);
        this.state = this.getView();
    }

    static back(){
        window.history.back();
    }

    static pushState(url){
        window.history.pushState(null,'', url);
        Events.emit('nav', {
            href: url
        });
    }

    getView(){
        let routes = Route._routes,
            url = Url.get(),
            view = (
                <div>
                    Empty view .!
                </div>
            );
        for(var i in routes){
            if(new RegExp('^'+i.replace(/\//g,'\\/')+'$').test(url)){
                view = routes[i];
            }
        }
        return view;
    }

    setView(){
        if(!Drawer.active){
            this.setState(this.getView());
            return;
        }
        Events
        .on('menu-transition-end', (e)=>{
            console.log('[Changing]');
            this.setState(this.getView());
        })
        .emit('close-menu')
    }

    static set(path, res){
        Route._routes[path] = res;
        return Route;
    }

    componentDidMount() {
        Events.on('nav', e => {
            this.setView();
        });
        window.addEventListener('popstate', e => {
            this.setView();
        });
    }

    render(){
        return (
            <>
                {this.state}
            </>
        );
    }
}
import React from 'react';
import Events from "../utils/Events";

export default class OverLayer extends React.Component{
    static active = false;
    constructor(props) {
        super(props);
        this.eventName = [];
        this.mounted = false;
    }

    setEventNames(list){
        this.eventName = list;
    }

    componentDidMount() {
        OverLayer.active = true;
        this.mounted = true;
        let open = this.open.bind(this)
        Events.on(this.eventName[0], ()=>{
            open(true);
        },this)
        Events.on(this.eventName[1], ()=>{
            open(false);
        },this)
    }

    componentWillUnmount() {
        OverLayer.active = false;
        this.mounted = false;
        // Events.off(this.eventName[0]).off(this.eventName[1]);
    }

    open(e){
        if(this.state.open == e){
            Events.emit(this.eventName[3]);
            return;
        }
        this.setState({
            open: e
        });
        setTimeout(()=>{
            Events.emit(this.eventName[3]);
        },300);
    }
}
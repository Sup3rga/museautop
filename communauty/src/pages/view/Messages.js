import React from "react";
import {Avatar, Chip} from "@mui/material";
import {Icon} from "../../components/Header";
import {EmptyView} from "../widget/BlankLoader";
import Events from "../../utils/Events";
import Management from "../../utils/Management";
import AlertableComponent from "./AlertableComponent";
import Link from "../../components/Link";
import UserRow from "../widget/UserRow";

function MessageRow(props){
    return <UserRow
        link={'/messenging/read/'+props.id}
        name={props.firstname+', '+props.lastname}
        date={props.postOn}
        info={props.message}
        read={props.readBy}
    />;
}

export default class Messages extends AlertableComponent{
    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            ...super.getState(),
            perdate: false,
            pername: false,
            desc: true,
            list: [],
            time: null
        }
    }

    componentDidMount() {
        Events.emit('set-prev',true);
        setTimeout(()=>Events.emit('set-prev',true), 200);
        Management.getMessages().then((data)=>{
            this.changeValue('list', data);
            this.refresh();
        }).catch((message)=>{
            this.toggleSnack({
                content: message
            });
            console.log('[Message]',message);
        })
    }

    componentWillUnmount(){
        Events.emit("set-prev",false);
        this.refresh(false);
    }

    changeValue(index, value){
        this.setState(state=>{
            return {
                ...state,
                [index] : value
            }
        })
    }

    refresh(open = true){
        if(open){
            this.timer = setInterval(()=>{
                this.changeValue('time', new Date());
            },1000);
        }
        else{
            clearInterval(this.timer);
        }
    }

    render() {
        return (
            <div className="ui-container ui-fluid ui-unwrap ui-column messages">
                <div className="ui-container ui-size-fluid header">
                    <h1 className="ui-container ui-size-fluid">
                       Messagerie
                    </h1>
                    <Chip
                        variant={this.state.perdate ? 'filled' : 'outlined'}
                        icon={<Icon mode="ion" icon={this.state.perdate ? "eye" : 'eye-disabled'}/>}
                        label="Par Date"
                        className={"sort-chip"}
                        onClick={()=>{
                            this.changeValue('pername', false);
                            this.changeValue('perdate', !this.state.perdate)
                        }}
                    />
                    <Chip
                        variant={this.state.pername ? 'filled' : 'outlined'}
                        icon={<Icon mode="ion" icon={this.state.pername ? "eye" : 'eye-disabled'}/>}
                        label="Par nom du client"
                        className={"sort-chip"}
                        onClick={()=>{
                            this.changeValue('perdate', false);
                            this.changeValue('pername', !this.state.perdate)
                        }}
                    />
                    <Chip
                        icon={<Icon icon={this.state.desc ? 'sort-alpha-down' : 'sort-alpha-down-alt'}/>}
                        className={"sort-chip icon"}
                        onClick={()=>this.changeValue('desc', !this.state.desc)}
                    />
                </div>
                <div className="ui-element ui-fluid ui-scroll-y list">
                    {
                        !this.state.list.length ?
                         <EmptyView
                            icon={<Icon icon="sms"/>}
                            text="Aucun message"
                         /> :
                         this.state.list.map((data, index)=>{
                            return <MessageRow {...data} key={index}/>
                         })
                    }
                </div>
                {this.renderDialog()}
            </div>
        )
    }
}
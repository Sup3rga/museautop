"use client";
import React from "react";
import Management from "../../utils/Management";
import {Icon} from "../../components/Header";
import {streaming} from "@/ui/lib/streamuing";
import Ressources from "@/ui/panel/utils/Ressources";

function DashboardStats({icon, label, counter, className}){
    return (
        <div className={`${className}`}>
            <div className="ui-container ui-size-fluid box ui-horizontal-center">
                {icon}
                <div className="ui-size-fluid">
                    {counter}
                </div>
                <div className="ui-size-fluid">
                    {label}
                </div>
            </div>
        </div>
    )
}
export default class Dashboard extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            managers: []
        }
        streaming.init(Ressources.apis);
    }
    render() {
        return (
            <div className="ui-element ui-fluid dashboard ui-scroll-y">
                <div className="ui-container ui-size-fluid ui-md-size-9 block">
                    <div className="ui-container ui-size-fluid greetings ui-vertical-center">
                        Salut <label>{" "+Management.data.firstname}</label> !
                    </div>
                    <div className="ui-element ui-size-fluid rtd">
                        <DashboardStats
                            className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 block"
                            icon={ <Icon icon="user"/>}
                            label={"Visiteurs actuels"}
                            counter={<streaming.ui.text url={"/get/visitors/stats"} filter={"lastVisitors"} placeholder={0}/>}
                        />
                        <DashboardStats
                            className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 block"
                            icon={<Icon icon="walking"/>}
                            label={"Nombre de visiteurs d'aujourd'hui"}
                            counter={<streaming.ui.text url={"/get/visitors/stats"} filter={"todayVisitors"} placeholder={0}/>}
                        />
                        <DashboardStats
                            className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 block"
                            icon={<Icon icon="globe"/>}
                            label={"Total de visites"}
                            counter={<streaming.ui.text url={"/get/visitors/stats"} filter={"getCumulatedVisites"} placeholder={0}/>}
                        />
                    </div>
                </div>
                <div className="ui-container ui-size-fluid ui-md-size-3 block">

                </div>
            </div>
        )
    }
}
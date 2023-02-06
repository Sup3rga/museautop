import React from "react";
import Management from "../../utils/Management";
import {Icon} from "../../components/Header";

export default class Dashboard extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            managers: []
        }
    }
    render() {
        return (
            <div className="ui-element ui-fluid dashboard ui-scroll-y">
                <div className="ui-container ui-size-fluid ui-md-size-9 block">
                    <div className="ui-container ui-size-fluid greetings ui-vertical-center">
                        Salut <label>{" "+Management.data.firstname}</label> !
                    </div>
                    <div className="ui-element ui-size-fluid rtd">
                        <div className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 block">
                            <div className="ui-container ui-size-fluid box ui-horizontal-center">
                                <Icon icon="user"/>
                                <div className="ui-size-fluid">
                                    {this.state.managers.length}
                                </div>
                                <div className="ui-size-fluid">
                                    Managers connectés
                                </div>
                            </div>
                        </div>
                        <div className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 block">
                            <div className="ui-container ui-size-fluid box ui-horizontal-center">
                                <Icon icon="walking"/>
                                <div className="ui-size-fluid">
                                    {this.state.managers.length}
                                </div>
                                <div className="ui-size-fluid">
                                    Clients en visite
                                </div>
                            </div>
                        </div>
                        <div className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 block">
                            <div className="ui-container ui-size-fluid box ui-horizontal-center">
                                <Icon icon="globe"/>
                                <div className="ui-size-fluid">
                                    {this.state.managers.length}
                                </div>
                                <div className="ui-size-fluid">
                                    Visites
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="ui-container ui-size-fluid ui-md-size-3 block">

                </div>
            </div>
        )
    }
}
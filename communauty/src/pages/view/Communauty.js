import React from "react";
import {Icon} from "../../components/Header";
import Route from "../../utils/Route";
import {Avatar, SpeedDial, SpeedDialIcon} from "@mui/material";
import Field from "../../components/Field";
import AlertableComponent from "./AlertableComponent";
import Management from "../../utils/Management";
import UserRow from "../widget/UserRow";

function ManagerRow(props){
    return (
        <div className="ui-container ui-size-fluid row">
           <UserRow
             link={null}
             name={props.firstname+' ' +props.lastname}
             info={"created"}
             read={true}
           />
        </div>
    )
}

export default class Communauty extends AlertableComponent{

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            list: []
        };
    }

    componentDidMount() {
        Management.getAllMembers().then((data)=>{
            this.changeValue('list',data);
        }).catch((message)=>{
            console.log('[Message]',message);
        })
    }

    render() {
        return (
            <div className="ui-container ui-fluid communauty">
                <div className="ui-container ui-fluid ui-unwrap ui-column">
                    <div className="ui-container ui-size-fluid header ui-vertical-center">
                        <Field placeholder="Recherchez quelqu'un"
                            className="field ui-size-4"
                            value={this.state.name}
                            onChange={(e)=>this.changeValue('name',e.target.value)}
                        />
                    </div>
                    <div className="ui-container ui-size-fluid ui-scroll-y list">
                        {
                            this.state.list.map((data, key)=>{
                                if(
                                    this.state.name.length &&
                                    data.firstname.toLowerCase().indexOf(this.state.name.toLowerCase()) < 0 &&
                                    data.lastname.toLowerCase().indexOf(this.state.name.toLowerCase()) < 0
                                ){
                                    return null;
                                }
                                console.log('[Data]',data);
                                return <ManagerRow key={key} {...data}/>
                            })
                        }
                    </div>
                </div>
                <SpeedDial
                    sx={{ position: 'absolute', bottom: 70, right: 16 }}
                    icon={<SpeedDialIcon/>}
                    ariaLabel={"ok"}
                    onClick={()=>{
                       Route.pushState("/communauty/integration")
                    }}
                >
                </SpeedDial>
            </div>
        )
    }
}
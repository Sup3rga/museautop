import React,{Component} from "react";
import Ckeditor from '@ckeditor/ckeditor5-react';
import Field from "../../components/Field";
// import SpeedDial from "../../components/SpeedDial";
import Link from "../../components/Link";
import {Icon} from "../../components/Header";
import {FormControl, InputLabel, MenuItem, Select, SpeedDial, SpeedDialAction, SpeedDialIcon} from "@mui/material";
import Route from "../../utils/Route";
import BlankLoader from "./BlankLoader";
import Main from "../Main";

export default class Writing extends Component{

    constructor(props) {
        super(props);
        this.state = {
            loading: true
        }
    }

    componentDidMount() {
        Main.socket
        .emit("fetch-categories", {type: 'writing', branch: Main.branch})
        .on("get-categories", (e)=>{
            console.log('[E]',e);
        });
    }

    static RenderSelect(props){
        let {list} = props;
        // delete props.list;
        return (
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{props.label}</InputLabel>
                <Select {...props}>
                    {
                        Object.keys(list).map((key,index)=>{
                            return <MenuItem value={key} key={index}>{list[key]}</MenuItem>
                        })
                    }
                </Select>
            </FormControl>
        )
    }

    render() {

        if(this.state.loading){
            return <BlankLoader/>
        }

        return (
            <div className="ui-container ui-size-fluid ui-fluid-height presentation">
                <div className="ui-container ui-size-fluid ui-unwrap grid-filter ui-vertical-center ui-height-2">
                    <div className="ui-element field-group ui-size-3">
                        <Writing.RenderSelect
                            className="ui-element ui-size-fluid field"
                            label = "Catégorie"
                            value = "all"
                            sx={{height: 40}}
                            list = {{
                                all: "Tout"
                            }}
                        />
                    </div>
                    <div className="ui-element field-group ui-size-3">
                        <Writing.RenderSelect
                            className="ui-element ui-size-fluid field"
                            label = "Année"
                            value = "all"
                            sx={{height: 40}}
                            list = {{
                                all: "Tout"
                            }}
                        />
                    </div>
                </div>
                <div className="ui-container ui-size-fluid ui-height-10 grid">

                </div>
                <SpeedDial sx={{ position: 'absolute', bottom: 70, right: 16 }}
                    icon={<SpeedDialIcon/>}
                    ariaLabel={"ok"}>
                    <SpeedDialAction
                        name="new"
                        icon={<Icon icon="feather"/>}
                        title={"Nouvel article"}
                        onClick={()=>Route.pushState('./writing/new')}
                    />
                    <SpeedDialAction
                        title="Catégorie"
                        name="category"
                        icon={<Icon icon="layer-group"/>}
                        onClick={()=>Route.pushState('./writing/category')}
                    />
                </SpeedDial>
            </div>
        );
    }
}
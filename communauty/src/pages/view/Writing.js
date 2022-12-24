import React,{Component} from "react";
import Ckeditor from '@ckeditor/ckeditor5-react';
import Field from "../../components/Field";
// import SpeedDial from "../../components/SpeedDial";
import Link from "../../components/Link";
import {Icon} from "../../components/Header";
import {FormControl, InputLabel, MenuItem, Select, SpeedDial, SpeedDialAction, SpeedDialIcon} from "@mui/material";
import Route from "../../utils/Route";

export default class Writing extends Component{

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
        return (
            <div className="ui-container ui-size-fluid ui-fluid-height presentation">
                <div className="ui-container ui-size-fluid ui-unwrap grid-filter ui-vertical-center ui-height-2">
                    <div className="ui-element field-group ui-size-3">
                        <Writing.RenderSelect
                            className="ui-element ui-size-fluid field"
                            label = "Catégorie"
                            value = "all"
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
                            list = {{
                                all: "Tout"
                            }}
                        />
                    </div>
                    <div className="ui-element field-group ui-size-3">
                        <Writing.RenderSelect
                            className="ui-element ui-size-fluid field"
                            label = "Filiale"
                            value = "all"
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
                        title={"bien"}
                        onClick={()=>Route.pushState('./writing/new')}
                    />
                </SpeedDial>
            </div>
        );
    }
}
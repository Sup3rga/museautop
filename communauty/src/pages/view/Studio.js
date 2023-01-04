import React from "react";
import Field from "../../components/Field";
import {Icon} from "../../components/Header";
import Route from "../../utils/Route";
import Link from "../../components/Link";
import Writing from "./Writing";
import {SpeedDial, SpeedDialAction, SpeedDialIcon} from "@mui/material";

export default class Studio extends React.Component{

    render() {
        return (
            <div className="ui-container ui-size-fluid ui-fluid-height presentation studio-grid">
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
                        icon={<Icon icon="pen"/>}
                        title={"bien"}
                        onClick={()=>Route.pushState('./studio/new')}
                    />
                    <SpeedDialAction
                        title="Catégorie"
                        name="category"
                        icon={<Icon icon="layer-group"/>}
                        onClick={()=>Route.pushState('./studio/category')}
                    />
                </SpeedDial>
            </div>
        )
    }
}
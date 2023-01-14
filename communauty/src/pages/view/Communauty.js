import React from "react";
import {Icon} from "../../components/Header";
import Route from "../../utils/Route";
import {SpeedDial, SpeedDialIcon} from "@mui/material";

export default class Communauty extends React.Component{

    render() {
        return (
            <div className="ui-container ui-fluid communauty">

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
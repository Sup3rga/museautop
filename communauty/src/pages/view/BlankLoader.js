import {CircularProgress} from "@mui/material";

export default function BlankLoader(){
    return (
        <div className="ui-container ui-size-fluid ui-fluid-height ui-all-center">
            <CircularProgress/>
        </div>
    )
}
import {CircularProgress} from "@mui/material";

export function EmptyView(props){
    const {icon = null, text = ""} = props;
    return (
        <div className="ui-container ui-fluid ui-all-center ui-fluid empty-temp">
            <div className="ui-element ui-horizontal-center">
                {!icon ? null :
                    <div className="ui-block">
                        {icon}
                    </div>
                }
                <div className="ui-block text">
                    {text}
                </div>
            </div>
        </div>
    )
}

export default function BlankLoader(){
    return (
        <div className="ui-container ui-size-fluid ui-fluid-height ui-all-center">
            <CircularProgress/>
        </div>
    )
}
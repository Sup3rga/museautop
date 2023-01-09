import React from 'react';
import Main from "../Main";
import {CircularProgress, LinearProgress} from "@mui/material";

export default class UploaderInfo extends React.Component{
    constructor(props) {
        super(props);
        const {
            open = false, title=null, progression=0,
            withLoader = true, text = null, processText = null
        } = props;
        this.open = open;
        this.title = title;
        this.progress = progression;
        this.withLoader = withLoader;
        this.text = text;
        this.processText = processText;
    }
    render(){
        return (
            <Main.DialogBox
                open={this.open}
                title= {this.title}
                content = {(
                    <div className="ui-container upload-info ui-size-fluid ui-horizontal-center">
                        <div className="ui-container ui-size-fluid ui-vertical-center">
                            {this.withLoader ? <CircularProgress/> : null}
                            <div className="ui-container text">
                                {this.text}
                            </div>
                        </div>
                        {
                            !this.processText || this.processText == '' ? null:
                            <div className="ui-container ui-size-fluid process-text">
                                {this.processText}
                            </div>
                        }
                        <LinearProgress
                            variant={this.progress ? 'determinate' : 'indeterminate'}
                            value={this.progress}
                        />
                    </div>
                )}
                buttons = {null}
            />
        )
    }
}
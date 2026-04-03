import React from 'react';
import Main from "../Main";
import {Box, CircularProgress, LinearProgress} from "@mui/material";

export default class UploaderInfo extends React.Component{
    constructor(props) {
        super(props);
    }
    render(){
        const {
            open = false, title=null, progression=0,
            withLoader = true, text = null, processText = null,
            nullDisplay=true
        } = this.props;
        return (
            <Main.DialogBox
                open={open}
                title= {title}
                content = {(
                    <div className="ui-container upload-info ui-size-fluid ui-horizontal-center">
                        <div className="ui-container ui-size-fluid wrapping ui-vertical-center">
                            {withLoader ? <CircularProgress size={25}/> : null}
                            <div className="ui-container wrapping text">
                                {text}
                            </div>
                        </div>
                        {
                            !processText || processText == '' ? null:
                            <div className="ui-container ui-size-fluid wrapping process-text">
                                {processText}
                            </div>
                        }
                        {
                            !nullDisplay && progression <= 0 ? null:
                            <Box width={{width: '100%', padding: '.5em 0'}}>
                                <LinearProgress
                                    variant={progression ? 'determinate' : 'indeterminate'}
                                    value={progression}
                                />
                            </Box>
                        }
                    </div>
                )}
                buttons = {null}
            />
        )
    }
}
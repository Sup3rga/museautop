import React from 'react';
import Main from "../Main";
import {Button} from "@mui/material";

export default class AlertableComponent extends React.Component{
    constructor(props) {
        super(props);
        this.state = this.getState();
    }

    getState(){
        return {
            dialog: {
                title: '',
                content: '',
                open: false,
                manual: true
            }
        }
    }

    toggleDialog(data){
        let {title=null, content = '', open = true, manual = true} = data;
        this.setState(state => {
            return {
                ...state,
                dialog: {
                    title, content, open, manual
                }
            }
        })
    }

    renderDialog(){
        return (
            <Main.DialogBox
                open={this.state.dialog.open}
                title= {this.state.dialog.title}
                content = {this.state.dialog.content}
                buttons = {!this.state.dialog.manual ? null : [
                    <Button variant="text" onClick={()=>{
                        this.toggleDialog({
                            open: false
                        })
                    }}>Ok</Button>
                ]}
            />
        );
    }
}
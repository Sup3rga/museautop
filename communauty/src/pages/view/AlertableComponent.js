import React from 'react';
import Main from "../Main";
import {Button, CircularProgress, Grid, Snackbar, Typography} from "@mui/material";

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
                manual: true,
                actions: [
                    <Button variant="text" onClick={()=>{
                        this.toggleDialog({
                            open: false
                        })
                    }}>Ok</Button>
                ]
            },
            snack:{
                open: false,
                content: ''
            }
        }
    }

    toggleDialog(data){
        let {title=null, content = '', open = true, manual = true, actions = this.state.dialog.actions} = data;
        this.setState(state => {
            return {
                ...state,
                dialog: {
                    title, content, open, manual, actions
                }
            }
        })
    }

    toggleSnack(data){
        let {open = true, content = ''} = data;
        this.setState(state => {
            return {
                ...state,
                snack: {
                    open, content
                }
            }
        });
    }

    showLoading(text = "Requête en cours..."){
        this.toggleDialog({
            manual: false,
            content: [
                <Grid container alignItems="center">
                    <CircularProgress/>
                    <Typography sx={{
                        padding: '.8em .4em'
                    }}>
                        {text}
                    </Typography>
                </Grid>
            ]
        });
    }

    renderDialog(){
        return (
            <>
                <Main.DialogBox
                    open={this.state.dialog.open}
                    title= {this.state.dialog.title}
                    content = {this.state.dialog.content}
                    buttons = {!this.state.dialog.manual ? null : this.state.dialog.actions}
                />
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    open={this.state.snack.open}
                    message={this.state.snack.content}
                    onClose={()=>{
                        this.toggleSnack({
                            open: false
                        })
                    }}
                    action={[
                        <Button variant="text" onClick={()=>this.toggleSnack({open: false})}>
                            Ok
                        </Button>
                    ]}
                />
            </>
        );
    }
}
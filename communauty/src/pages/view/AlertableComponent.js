import React from 'react';
import Main from "../Main";
import {Button, CircularProgress, Grid, Snackbar, Typography} from "@mui/material";
import UploaderInfo from "../widget/UploaderInfo";
import Events from "../../utils/Events";

export default class AlertableComponent extends React.Component{
    constructor(props) {
        super(props);
        this.state = this.getState();
        this.mounted = false;
    }

    changeValue(index, value){
        this.setState(state => {
            return {
                ...state,
                [index] : value
            }
        })
    }

    changeState(value){
        this.setState(state=>{
            return {
                ...state,
                ...value
            }
        });
    }

    componentWillUnmount() {
        this.mounted = false;
        Events.emit("set-prev",true);
        setTimeout(()=>{Events.emit("set-prev",true);},300);
    }

    componentDidMount() {
        this.mounted = true;
        Events.emit("set-prev",false);
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
            },
            upload:{
                open: false,
                text: '',
                process: '',
                progress: 0,
                nullDisplay : false
            }
        }
    }

    toggleUploadInfo(data){
        const {open = true, text = '', process = '', progress = 0, nullDisplay = false} = data;
        this.setState(state => {
            return {
                ...state,
                upload: {
                    open, text, process, progress, nullDisplay
                }
            }
        });
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
                <UploaderInfo
                    open={this.state.upload.open}
                    text={this.state.upload.text}
                    nullDisplay={false}
                    processText={this.state.upload.process}
                    progression={this.state.upload.progress}
                />
            </>
        );
    }
}
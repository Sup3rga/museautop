import React from 'react';
import Main from "../Main";
import {Button, CircularProgress, Grid, Snackbar, Typography} from "@mui/material";
import UploaderInfo from "../widget/UploaderInfo";
import Events from "../../utils/Events";
import {Icon} from "../../components/Header";
import BlankLoader from "../widget/BlankLoader";

export default class AlertableComponent extends React.Component{
    constructor(props) {
        super(props);
        this.executor = null;
        this.block = null;
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
        Events.emit("set-prev",false);
    }

    componentDidMount() {
        this.mounted = true;
        Events.emit("set-prev",true);
        Events.on("branch-switch", ()=>{
            this.changeValue('loading', true);
            this.reload();
        },this);
        setTimeout(()=>{Events.emit("set-prev",true);},300);
    }

    reload(){}

    getState(){
        return {
            reloadable: null,
            loading: true,
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

    getReloadableView(message = "Oupps !", reloadable=true, icon = "plug"){
        return (
            <div className="ui-container ui-fluid ui-all-center reload-view">
                <div className="ui-container ui-size-fluid ui-sm-size-8 ui-md-size-6 ui-horizontal-center">
                    <Icon icon={icon}/>
                    <div className="ui-container ui-size-fluid ui-horizontal-justify message">
                        {message}
                    </div>
                    {
                        !reloadable ? null :
                        <Button
                            startIcon={<Icon icon="sync"/>}
                            onClick={()=>{
                                this.state.reloadable = null;
                                this.reload();
                            }}
                        >Recharger</Button>
                    }
                </div>
            </div>
        )
    }

    setReloadable(message, reloadable=true, icon = "plug"){
        this.changeValue('reloadable', this.getReloadableView(message,reloadable,icon))
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

    banForPrivilege(){
        this.setReloadable(
            <div className="ui-container ui-fluid ui-all-center ban-message">
                <div className="ui-container">
                    <h1 className="ui-container ui-size-fluid ui-horizontal-center">Ouups !</h1>
                    <p>
                        Il semblerait que vous n'avez pas accès à cet espace !
                    </p>
                </div>
            </div>,
            false,
            "user-shield"
        )
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

    blockRender(){
        if(this.state.reloadable) return this.state.reloadable;
        if(this.state.loading) return <BlankLoader/>;
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
import React from 'react';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import DefaultEditor from "./DefaultEditor";
import Events from "../../utils/Events";
import UploadAdapter from "../../utils/UploadAdapter";
import Main from "../Main";
import {Button, CircularProgress, TextField, Typography, Box, IconButton, Grid, Switch} from "@mui/material";
import Management from "../../utils/Management";
import Writing from "./Writing";
import AlertableComponent from "./AlertableComponent";
import Route from "../../utils/Route";
import {Icon} from "../../components/Header";


export default class Redactor extends AlertableComponent{

    constructor(props) {
        super(props);
        this.state = {
            ...super.getState(),
            title: '',
            content: '',
            date: '',
            time: '',
            publishauto: false,
            categories: {},
            category: '',
            img: [],
            openConfig: false
        }
    }

    componentDidMount() {
        Events.emit("set-prev", true);
        setTimeout(()=>Events.emit("set-prev", true), 300);
        Management.getArticlesCategory().then(data => {
            const r = {};
            for(let i in data){
                r[data[i].id] = data[i].name;
            }
            this.setState(state => {
                return {
                    ...state,
                    categories: r
                }
            });
        })
    }

    componentWillUnmount() {
        Events.emit("set-prev",false);
    }

    extractImg(){
        this.state.img = [];
        const extract = this.state.content.match(/<img src="(.+?)">/g);
        if(extract) {
            let image;
            for (let i = 0; i < extract.length; i++) {
                image = extract[i].replace(/^<img src="(.+?)">/, '$1');
                if (i == 0) {
                    this.state.caption = image;
                }
                this.state.img.push(image);
            }
        }
    }

    submit(){
        if(!this.state.title.length || !this.state.content.length || !this.state.category.length){
            this.toggleDialog({
                open: true,
                content: "Vous devez soumettre un article avec au moins un titre, un contenu dans une catégorie spécifique"
            });
            return;
        }
        this.state.caption = null;
        this.extractImg();
        this.showLoading();
        const schedule = this.state.publishauto || !this.state.date.length || !this.state.time.length ? null : this.state.date+' '+this.state.time;
        Main.socket.emit("/writing/write", {
            title: this.state.title,
            content: this.state.content,
            caption: this.state.caption,
            category: this.state.category,
            schdate: schedule,
            img: this.state.img,
            ...Management.defaultQuery()
        }).once('/writing/write/response', (data)=>{
            if(data.error){
                this.toggleDialog({
                    content: Management.readCode(data.code),
                    manual: true
                });
                return;
            }
            this.toggleDialog({open: false});
            this.toggleSnack({
                content: Management.readCode(data.code)
            });
            setTimeout(()=>{
                Route.back();
            }, 300);
        });
    }

    async save(){
        if(!this.state.title.length || !this.state.content.length){
            this.toggleDialog({
                open: true,
                content: "Veuillez renseigner au moins le titre et le contenu de l'article pour l'enregistrer pour plus tard"
            });
            return;
        }
        this.extractImg();
        if(this.state.img.length) {
            this.toggleDialog({
                open: true,
                content: "Les images uploadés de votre article sont disponibles seulement pour 5 jours !"
            });
        }
       await Management.addDraft({
            title: this.state.title,
            content: this.state.content,
            category: this.state.category,
            date: this.state.date,
            time: this.state.time,
            draft: true
        });
    }

    toggleConfigurationBox(open = true){
        this.setState(state => {return {...state, openConfig: open}});
    }

    updateData(index, value){
        this.setState(state => {
            return {
                ...state,
                [index] : value
            }
        });
    }

    render() {
        return (
            <div className="ui-container editor ui-size-fluid ui-fluid-height">
                <div className="ui-container ui-size-fluid head ui-vertical-center">
                    <div className={"ui-container ui-size-7 title " + (this.state.title.length ? '' : 'empty')}
                        onClick={()=>this.toggleConfigurationBox()}
                    >
                        {this.state.title.length ? this.state.title : "Le titre de l'article"}
                    </div>
                    <div className="ui-container ui-size-5 ui-horizontal-right actions">
                        <IconButton
                            sx={{
                                color: 'black'
                            }}
                            onClick={()=>this.toggleConfigurationBox()}
                        >
                            <Icon icon="cog"/>
                        </IconButton>
                        <IconButton
                            sx={{
                                color: '#348'
                            }}
                            onClick={()=>this.submit()}
                        >
                            <Icon icon="save"/>
                        </IconButton>
                        <IconButton sx={{
                            color: 'black'
                        }}>
                            <Icon icon="business-time"/>
                        </IconButton>
                    </div>
                </div>
                <div className="ui-container ui-size-fluid ui-fluid-height ui-scroll-y">
                    <CKEditor
                        editor={ ClassicEditor }
                        data={this.state.content}
                        onReady={ editor => {
                            editor.plugins.get('FileRepository').createUploadAdapter = (loader)=>{
                                return new UploadAdapter(loader,'artimg');
                            }
                            // console.log( 'Redactor is ready to use!', editor );
                        } }
                        onChange={ ( event, editor ) => {
                            // const data = editor.getData();
                            this.state.content = editor.getData();
                            // console.log( { event, editor, data } );
                        } }
                        onBlur={ ( event, editor ) => {
                            // console.log( 'Blur.', editor );
                        } }
                        onFocus={ ( event, editor ) => {
                            // console.log( 'Focus.', editor );
                        } }
                    />
                </div>
                <Main.DialogBox
                    title="Informations de l'article"
                    open={this.state.openConfig}
                    content = {
                        <Box className="ui-container ui-vwidth-10 ui-md-vwidth-6">
                            <TextField
                                className="ui-element ui-size-fluid"
                                label="Le titre de l'article"
                                variant="outlined"
                                value={this.state.title}
                                onChange={(e)=>{
                                    this.updateData('title', e.target.value);
                                }}
                            />
                            <Box sx={{padding: '1em 0', width: '100%'}}>
                                <Writing.RenderSelect
                                    label="Catégorie"
                                    list={this.state.categories}
                                    value={this.state.category}
                                    onChange={(e)=>{
                                        this.updateData('category', e.target.value);
                                    }}
                                />
                            </Box>
                            <div className="ui-container ui-size-fluid ui-vertical-center">
                                <Switch checked={this.state.publishauto}
                                    onChange={(e)=>{
                                        this.updateData('publishauto', e.target.checked);
                                    }}
                                />
                                <label>Publier automatiquement</label>
                            </div>
                            {
                                this.state.publishauto ? null :
                                <Grid container alignItems="center" sx={{padding: '.5em 0', width: '100%'}}>
                                    <Grid item sx={{padding: '0', width: '50%'}}>
                                        <TextField
                                            className="ui-container ui-size-fluid"
                                            type="date"
                                            value={this.state.date}
                                            onChange={(e)=>{
                                                this.updateData('date', e.target.value);
                                            }}
                                        />
                                    </Grid>
                                    <Grid item sx={{padding: '0', width: '50%'}}>
                                        <TextField
                                            className="ui-container ui-size-fluid"
                                            type="time"
                                            value={this.state.time}
                                            onChange={(e)=>{
                                                this.updateData('time', e.target.value);
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            }
                        </Box>
                    }
                    buttons={
                        <Button onClick={()=>this.toggleConfigurationBox(false)}>Ok</Button>
                    }
                />
                {super.renderDialog()}
            </div>
        )
    }
}
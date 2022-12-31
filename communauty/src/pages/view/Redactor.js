import React from 'react';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import DefaultEditor from "./DefaultEditor";
import Events from "../../utils/Events";
import UploadAdapter from "../../utils/UploadAdapter";
import Main from "../Main";
import {Button, CircularProgress, TextField, Typography, Box} from "@mui/material";
import Management from "../../utils/Management";
import Writing from "./Writing";
import AlertableComponent from "./AlertableComponent";
import Route from "../../utils/Route";


export default class Redactor extends AlertableComponent{

    constructor(props) {
        super(props);
        this.state = {
            ...super.getState(),
            title: '',
            content: '',
            categories: {},
            category: '',
            img: []
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

    submit(){
        if(!this.state.title.length || !this.state.content.length || !this.state.category.length){
            this.toggleDialog({
                open: true,
                content: "Vous devez soumettre un article avec au moins un titre, un contenu dans une catégorie spécifique"
            });
            return;
        }
        this.state.caption = null;
        this.state.img = [];
        this.showLoading();
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
        Main.socket.emit("/writing/write", {
            title: this.state.title,
            content: this.state.content,
            caption: this.state.caption,
            category: this.state.category,
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
            Route.back();
        });
    }

    render() {
        return (
            <div className="ui-container editor ui-size-fluid ui-fluid-height">
                <div className="ui-container ui-size-fluid head">
                    <div className="ui-container ui-size-6">
                        <TextField
                           className="ui-element ui-size-fluid"
                           label="Le titre de l'article"
                           variant="outlined"
                           value={this.state.title}
                           onChange={(e)=>{
                               this.setState(state => {
                                   return {
                                       ...state,
                                       title: e.target.value
                                   }
                               });
                           }}
                        />
                        {/*<Field placeholder="Le titre de l'article" className="field ui-element ui-size-fluid"/>*/}
                    </div>
                    <div className="ui-container ui-size-3">
                        <Writing.RenderSelect
                            label="Catégorie"
                            list={this.state.categories}
                            value={this.state.category}
                            onChange={(e)=>{
                                this.setState(state => {
                                    return {
                                        ...state,
                                        category: e.target.value
                                    }
                                })
                            }}
                        />
                    </div>
                    <div className="ui-container ui-size-3 actions">
                        <Button className="ui-element ui-size-fluid"
                                variant="outlined"
                                onClick={()=> this.submit() }
                        >
                            Publier
                        </Button>
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
                {super.renderDialog()}
            </div>
        )
    }
}
import React from 'react';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
// import DefaultEditor from "./DefaultEditor";
import Events from "../../utils/Events";
import UploadAdapter from "../../utils/UploadAdapter";
import Main from "../Main";
import {Button, TextField} from "@mui/material";
import Management from "../../utils/Management";


export default class Redactor extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            title: '',
            content: 'Write your article'
        }
    }

    componentDidMount() {
        Events.emit("set-prev", true);
        setTimeout(()=>Events.emit("set-prev", true), 300);
    }

    componentWillUnmount() {
        Events.emit("set-prev",false);
    }

    submit(){
        console.log('[Submit]',this.state,Management.data);
        Main.socket.emit("submit-article", {
            ...this.state,
            cmid: Management.data.id
        });
    }

    render() {
        return (
            <div className="ui-container editor ui-size-fluid ui-fluid-height">
                <div className="ui-container ui-size-fluid head">
                    <div className="ui-container ui-size-9 ui-md-size-6">
                        <TextField className="ui-element ui-size-fluid"
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
            </div>
        )
    }
}
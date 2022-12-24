import React from 'react';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Events from "../../utils/Events";
import UploadAdapter from "../../utils/UploadAdapter";
import Main from "../Main";
import Field from "../../components/Field";

export default class Editor extends React.Component{

    componentDidMount() {
        Events.emit("set-prev", true);
    }

    componentWillUnmount() {
        Events.emit("set-prev",false);
    }

    render() {
        return (
            <div className="ui-container editor ui-size-fluid ui-fluid-height">
                <div className="ui-container ui-size-fluid head">
                    <div className="ui-container ui-size-9">
                        <Field placeholder="Le titre de l'article" className="field ui-element ui-size-fluid"/>
                    </div>
                    <div className="ui-container ui-size-3 actions">
                        <button className="ui-button light ui-element ui-size-fluid">Publier</button>
                    </div>
                </div>
                <div className="ui-container ui-size-fluid ui-fluid-height ui-scroll-y">
                    <CKEditor
                        editor={ ClassicEditor }
                        onReady={ editor => {
                            editor.plugins.get('FileRepository').createUploadAdapter = (loader)=>{
                                return new UploadAdapter(loader,Main.socket);
                            }
                            // console.log( 'Redactor is ready to use!', editor );
                        } }
                        onChange={ ( event, editor ) => {
                            // const data = editor.getData();
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
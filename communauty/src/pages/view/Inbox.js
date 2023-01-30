import React from 'react';
import {IconButton, TextField} from "@mui/material";
import {Icon} from "../../components/Header";
import BlankLoader, {EmptyView} from "../widget/BlankLoader";
import Management from "../../utils/Management";
import Url from "../../utils/Url";
import Route from "../../utils/Route";
import Events from "../../utils/Events";
import UploadAdapter from "../../utils/UploadAdapter";
import {CKEditor} from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Constraint from "../../utils/Constraint";
import AlertableComponent from "./AlertableComponent";

export default class Inbox extends AlertableComponent{
    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            ...super.getState(),
            openReplier: false,
            loading: true,
            notFound: false,
            client: null,
            firstname: null,
            lastname: null,
            message: null,
            postOn: null,
            readBy: null,
            time: null,
            id: null,
            replies: [],
            replySubject: '',
            replyText: ''
        }
    }

    reload(){
        /^\/messenging\/read\/([0-9]+)$/.exec(Url.get());
        const id = RegExp.$1;
        if(!id){
            return Route.back();
        }
        Management.getMessages(id).then((messageData)=>{
            if(!messageData){
                return this.changeValue('notFound', true);
            }
            this.setState(state => {
                return {
                    ...state,
                    loading: false,
                    ...messageData
                }
            });
            this.refresh();
        }).catch((message)=>{
            this.setReloadable(message);
        })
    }

    componentDidMount() {
        super.componentDidMount();
        this.reload();
    }

    refresh(open = true){
        if(open){
            this.timer = setInterval(()=>{
                this.changeValue('time', new Date());
            },1000);
        }
        else{
            clearInterval(this.timer);
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.refresh(false);
    }

    changeValue(index, value){
        this.setState(state => {
            return {
                ...state,
                [index] : value
            }
        })
    }

    async reply(){
        this.toggleUploadInfo({
            text: 'Envoi de la réponse en cours...'
        });
        try{
            const data = await Management.sendMessageReply({
                msgid: this.state.id,
                subject: this.state.replySubject,
                message: this.state.replyText
            });
            this.setState(state => {
                return {
                    ...state,
                    ...data
                }
            });
            this.changeValue('openReplier', false);
            this.changeValue('replySubject', '');
            this.changeValue('replyText', '');
        }catch(content){
            this.toggleDialog({content});
        }
        this.toggleUploadInfo({open: false});
    }

    async delete(){
        this.toggleUploadInfo({
            text: 'Requête en cours...'
        });
        try{
            const data = await Management.deleteMessage({
                delid: this.state.id
            });
            this.toggleDialog({
                content: 'Message supprimé avec succes !'
            });
            setTimeout(()=>{
                if(this.mounted) Route.back();
            },3000);
        }catch(content){
            this.toggleDialog({content});
        }
        this.toggleUploadInfo({open: false});
    }

    render() {
        if(this.block = this.blockRender()) return this.block;
        if(this.state.notFound) return <EmptyView
            icon={<Icon icon='times'/>}
            text="Aucun message trouvé !"
        />
        if(this.state.loading) return <BlankLoader/>;
        let text = [];
        for(let i in this.state.message){
            if(this.state.message[i] == '\n'){
                text.push(<br/>)
            }
            text.push(this.state.message[i]);
        }
        return (
            <div className="ui-container ui-fluid ui-unwrap ui-relative ui-column inbox">
                <div className="ui-container ui-size-fluid header">
                    <div className="ui-container ui-size-fluid ui-vertical-center ui-unwrap">
                        <div className="ui-container ui-size-8 name">
                            {this.state.firstname+ ' ' + this.state.lastname}
                        </div>
                        {
                            this.state.openReplier ? null :
                            <div className="ui-container ui-size-4 actions">
                                <IconButton onClick={()=>this.changeValue('openReplier', true)}>
                                    <Icon icon="reply"/>
                                </IconButton>
                                <IconButton onClick={()=>this.delete()}>
                                    <Icon icon="trash"/>
                                </IconButton>
                            </div>
                        }
                    </div>
                    <div className="ui-container ui-size-fluid reference">
                        <span className="ui-element data">
                            &lt;{this.state.client.mail}&gt;
                        </span>
                        <span className="ui-element data">
                            {Management.getDateString(this.state.postOn)}
                        </span>
                    </div>
                </div>
                <div className="ui-container ui-fluid ui-relative body ui-no-scroll">
                    <div className="ui-element ui-fluid ui-scroll-y discussion">
                        <div className="ui-container ui-size-fluid message">
                            {text}
                        </div>
                        {
                            this.state.replies.map((data,key)=>{
                                return (
                                    <div key={key} className="ui-container ui-size-fluid reply">
                                        <div className="ui-container ui-size-fluid header">
                                            <div className="ui-container ui-size-fluid ui-vertical-center">
                                                <Icon icon="reply"/>
                                                <span className="ui-element subject">
                                                    {data.object}
                                                </span>
                                            </div>
                                            <div className="ui-container ui-size-fluid by">
                                                <strong>Par : </strong>
                                                {data.createdBy.firstname+ ' ' +data.createdBy.lastname}
                                            </div>
                                            <div className="ui-container ui-size-fluid date">
                                                {Management.getDateString(data.createdAt)}
                                            </div>
                                        </div>
                                        <div className="ui-container ui-size-fluid message">
                                            {data.body}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div className={"ui-container ui-column ui-unwrap ui-fluid ui-absolute ui-all-close replier "+(this.state.openReplier ? 'open' : '')}>
                        <div className="ui-container ui-size-fluid header">
                            <div className="ui-container ui-size-fluid ui-spaced">
                                <div className="ui-element ui-size-3 ui-md-size-2">
                                    <IconButton onClick={()=>this.changeValue('openReplier', false)}>
                                        <Icon icon="times"/>
                                    </IconButton>
                                </div>
                                <div className="ui-element ui-size-3 ui-md-size-2 ui-horizontal-right">
                                    <IconButton
                                        onClick={()=>this.reply()}
                                        disabled={
                                            !Constraint.containsText(this.state.replySubject) ||
                                            !Constraint.containsText(this.state.replyText)
                                        }
                                        sx={{
                                            color: '#004'
                                        }}
                                    >
                                        <Icon mode="ion" icon="android-send"/>
                                    </IconButton>
                                </div>
                            </div>
                            <div className="ui-container ui-size-fluid">
                                <TextField variant={"standard"}
                                    placeholder={"Le sujet du message"}
                                    className="ui-size-fluid"
                                    value={this.state.replySubject}
                                    onChange={(e)=>this.changeValue('replySubject', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="ui-container ui-fluid editor">
                            <CKEditor
                                editor={ ClassicEditor }
                                data={this.state.replyText}
                                onReady={ editor => {
                                    editor.plugins.get('FileRepository').createUploadAdapter = (loader)=>{
                                        return new UploadAdapter(loader,'mailimg', Management.server);
                                    }
                                    // console.log( 'Redactor is ready to use!', editor );
                                } }
                                onChange={ ( event, editor ) => {
                                    // const data = editor.getData();
                                    this.changeValue('replyText', editor.getData());
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
                </div>
                {this.renderDialog()}
            </div>
        )
    }
}
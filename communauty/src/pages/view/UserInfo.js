import AlertableComponent from "./AlertableComponent";
import BlankLoader from "../widget/BlankLoader";
import Url from "../../utils/Url";
import Management from "../../utils/Management";
import Filter from "../../utils/Filter";
import {Avatar, Box, Button, Chip, CircularProgress, IconButton, LinearProgress} from "@mui/material";
import {Icon} from "../../components/Header";
import {createRef} from "react";
import Events from "../../utils/Events";
import Route from "../../utils/Route";
import Main from "../Main";

export default class UserInfo extends AlertableComponent{
    constructor(props) {
        super(props);
        this.input = createRef();
        this.state = {
            ...super.getState(),
            self: true,
            id: 0,
            avatar: null,
            active: false,
            createdAt: null,
            createdBy: null,
            firstname: null,
            lastname: null,
            level: null,
            branchesData: null,
            mail: null,
            nickname: null,
            avatarUploading: null,
            uploadProgress: 0,
            phone: null,
            currentBranch: Main.branch,
            loadingError: null
        };
    }

    setReady(data){
        data = Filter.object(data, [
            'active','createdAt','createdBy','firstname','lastname',
            'level','branchesData','mail','nickname','phone', 'id', 'avatar'
        ]);
        console.log('[Data]',data);
        this.setState({
            loading: false,
            currentBranch: Main.branch in data.level ? Main.branch : Object.keys(data.level)[0],
            ...data
        });
    }

    reload(){
        this.state.self = /^\/usr/.test(Url.get());
        if(this.state.self){
            this.setReady(Management.data);
        }
        else{
            /^\/communauty\/usr\/([0-9]+)$/.exec(Url.get());
            const id = RegExp.$1;
            if(!id){
                return this.changeValue('loadingError', true);
            }
            Management.getMemberData(id).then((data)=>{
                this.setReady(data);
            }).catch(this.setReloadable.bind(this));
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.reload();
        Events.on('nav', ()=>{
            if(/^(\/usr|\/communauty\/usr\/[0-9]+)$/.test(Url.get())){
                this.reload();
            }
        });
    }

    async upload(files){
        this.changeValue('avatarUploading', true);
        try{
            const data = await Management.setProfile(files, (progress)=>{
                this.changeValue('uploadProgress', progress);
            });
            Events.emit("personal-data-updated");
            this.setReady(data);
        }catch (content){
            this.toggleDialog({content});
        }
        this.changeValue('avatarUploading', false);
    }

    render() {
        if(this.block = this.blockRender()) return this.block;
        return (
            <div className="ui-container ui-fluid ui-scroll-y usr ui-horizontal-center">
                <div className="ui-element ui-size-fluid ui-md-size-6 ui-horizontal-left">
                    <div className="ui-container ui-size-fluid id-box ui-horizontal-center">
                        <div className="ui-element">
                            <Avatar className="avatar" src={this.state.avatar}>
                                {this.state.firstname[0].toUpperCase()}
                                {
                                    !this.state.avatarUploading ? null:
                                    <div className="ui-container ui-absolute  mask ui-fluid ui-all-center">
                                        <CircularProgress
                                            variant={this.state.uploadProgress > 0 ? 'determinate' : 'indeterminate'}
                                            value={this.state.uploadProgress}
                                        />
                                    </div>
                                }
                            </Avatar>
                            {
                                !this.state.self ? null :
                                <>
                                    <input
                                        type="file"
                                        className="ui-hide"
                                        ref={this.input}
                                        onChange={(e)=>this.upload(e.target.files[0])}
                                    />
                                    <Button
                                        variant="contained"
                                        className="pick-photo"
                                        onClick={()=>this.input.current.click()}
                                    >
                                        <Icon icon="camera"/>
                                    </Button>
                                </>
                            }
                        </div>
                        <div className="ui-container ui-size-fluid name ui-all-center">
                            {this.state.firstname+', '+this.state.lastname}
                            {this.state.createdBy ? null : <Icon icon="shield-alt"/>}
                        </div>
                        <div className="ui-container ui-size-fluid since ui-horizontal-center">
                            Membre depuis {Management.getDateString(this.state.createdAt, false)}
                        </div>
                        <div className="ui-container ui-size-fluid ui-horizontal-center">
                            <Button
                                startIcon={ <Icon icon="pen"/>}
                                className="mui-button"
                                onClick={()=>Route.pushState("/communauty/integration/"+this.state.id)}
                            >
                               Modifier les informations
                            </Button>
                        </div>
                    </div>
                    <div className="ui-container ui-size-fluid infos">
                        <div className="ui-container row ui-size-fluid">
                            <Icon icon="sms"/>
                            <div className="ui-element ui-size">
                                {this.state.mail}
                            </div>
                        </div>
                        <div className="ui-container row ui-size-fluid">
                            <Icon icon="at"/>
                            <div className="ui-element ui-size">
                                {this.state.nickname}
                            </div>
                        </div>
                        <div className="ui-container row ui-size-fluid">
                            <Icon icon="phone"/>
                            <div className="ui-element ui-size">
                                {this.state.phone}
                            </div>
                        </div>
                        {
                            !this.state.createdBy ? null :
                            <div className="ui-container row ui-size-fluid">
                                <Icon icon="user-shield"/>
                                <div className="ui-element ui-size">
                                    {this.state.createdBy.firstname+' '+this.state.createdBy.lastname}
                                </div>
                            </div>
                        }
                    </div>
                    <div className="ui-container ui-size-fluid branches">
                        <div className="ui-container ui-size-fluid head">
                            <div className="ui-container ui-size-fluid text">
                                Filiale(s) assignée(s)
                            </div>
                        {
                            Object.keys(this.state.level).map((branch)=>{
                                return <Chip
                                    label={this.state.branchesData[branch].name}
                                    variant={branch == this.state.currentBranch ? 'filled' : 'outlined'}
                                    key={this.state.branchesData[branch].name}
                                    onClick={()=>this.changeValue('currentBranch', branch)}
                                />
                            })
                        }
                        </div>
                        {
                            Object.keys(this.state.level[this.state.currentBranch]).map((name) => {
                                const percent = this.state.level[this.state.currentBranch][name];
                                const style = {
                                    width: percent+'%',
                                    backgroundColor : (percent < 25 ? '#ffe8e8': percent < 50 ? '#fff5cf' : percent < 75? '#ebffe3' : '#d9e7ff')
                                }
                                return (
                                    <div className="ui-container ui-size-fluid access-group ui-vertical-center">
                                        <label>{name}</label>
                                        <div
                                            className="ui-element progress-line ui-absolute ui-left-close"
                                            style={style}
                                        />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }
}
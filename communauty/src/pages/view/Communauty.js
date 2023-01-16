import React from "react";
import {Icon} from "../../components/Header";
import Route from "../../utils/Route";
import {Avatar, Chip, IconButton, SpeedDial, SpeedDialIcon} from "@mui/material";
import Field from "../../components/Field";
import AlertableComponent from "./AlertableComponent";
import Management from "../../utils/Management";
import UserRow from "../widget/UserRow";
import Main from "../Main";
import AuthBox from "../widget/AuthBox";
import {EmptyView} from "../widget/BlankLoader";

function ManagerRow(props){
    const {modifier = null, state = null} = props;
    return (
        <div className="ui-container ui-size-fluid row">
           <UserRow
             name={props.firstname+' ' +props.lastname}
             link={"/communauty/usr/"+props.id}
             avatar={props.avatar}
             options={[
                 {
                     label: "Modifier Mot de passe",
                     className: 'option-item',
                     icon: <Icon icon="key"/>,
                     click: (e,close)=>{
                         close();
                         if(modifier){
                             modifier('showBox', props.id);
                         }
                     }
                 },
                 {
                     label: props.active ? "Désactiver" : "Activer",
                     icon: <Icon icon={props.active ? "lock" : "lock-open"}/>,
                     className: 'option-item',
                     click: (e,close)=>{
                         close();
                         if(state){
                             state({
                                 showAuth: props.id,
                                 block: !props.active
                             });
                         }
                     }
                 },
                 {
                     label: "Modifier les informations",
                     className: 'option-item',
                     icon: <Icon icon="info-circle"/>,
                     click: ()=>Route.pushState("/communauty/integration/"+props.id)
                 }
             ]}
             info={
                 !props.active ?
                 <div className="ui-container ui-size-fluid status ui-vertical-center">
                     <Icon icon="lock"/> compte bloqué
                 </div>
                 :
                 props.status[Main.branch].map((status,key)=>{
                     return <Chip
                         variant="filled"
                         key={key}
                         label={status}
                         sx={{margin: ".2em"}}
                         size="small"
                     />
                 })
             }
           />
        </div>
    )
}

export default class Communauty extends AlertableComponent{

    constructor(props) {
        super(props);
        this.password = null;
        this.auth = null;
        this.currentMan = 0;
        this.state = {
            ...super.getState(),
            name: '',
            block: null,
            showAuth: 0,
            showBox: 0,
            list: []
        };
    }

    componentDidMount() {
        console.log('[Fetching...]')
        Management.getAllMembers().then((data)=>{
            this.changeValue('list',data);
        }).catch((message)=>{
            console.log('[Message]',message);
        })
    }

    async submit(){
        const passwordChange = this.password && this.state.block === null;
        if(!passwordChange && typeof this.state.block != 'boolean'){
            return;
        }
        try {
            this.toggleUploadInfo({
                text: passwordChange ? 'Réinitialisation du mot de passe en cours...' :
                !this.state.block ? 'Blocage du compte en cours...' : 'Déblocage du compte en cours...'
            });
            let data = [];
            console.log('[mod]', passwordChange);
            if(passwordChange) {
                data = await Management.changePassword({
                    psw: this.password,
                    manid: this.currentMan,
                    auth: this.auth
                });
            }
            else{
                data = await Management.blockManager({
                    manid: this.currentMan,
                    auth: this.auth,
                    block: this.state.block
                });
            }
            this.toggleDialog({
                content: passwordChange ? "Réinitialisation réussie !" :
                    !this.state.block ? 'Blocage de compte réussi' : 'Déblocage de compte réussi'
            });
            this.changeValue('list',data);
        }catch (content){
            this.toggleDialog({content});
        }
        this.toggleUploadInfo({open: false})
    }

    reset(){
        this.password = null;
        this.state.block = null;
        this.currentMan = null;
        this.auth = null;
    }

    render() {
        console.log('[box]',this.state.showBox);
        let ttl = 0;
        return (
            <div className="ui-container ui-fluid communauty">
                <div className="ui-container ui-fluid ui-unwrap ui-column">
                    <div className="ui-container ui-size-fluid header ui-vertical-center">
                        <Field placeholder="Recherchez quelqu'un"
                            className="field ui-size-4"
                            value={this.state.name}
                            onChange={(e)=>this.changeValue('name',e.target.value)}
                        />
                    </div>
                    <div className="ui-element ui-fluid ui-scroll-y list">
                        {
                            !this.state.list.length ?
                             <EmptyView
                                icon={<Icon icon="users"/>}
                                text="Aucun membre trouvé !"
                             />
                             :
                            this.state.list.map((data, key)=>{
                                if(
                                    this.state.name.length &&
                                    data.firstname.toLowerCase().indexOf(this.state.name.toLowerCase()) < 0 &&
                                    data.lastname.toLowerCase().indexOf(this.state.name.toLowerCase()) < 0
                                ){
                                    return null;
                                }
                                ttl++;
                                console.log('[Data]',data);
                                return <ManagerRow
                                        key={key}
                                        {...data}
                                        modifier={this.changeValue.bind(this)}
                                        state={this.changeState.bind(this)}
                                />
                            })
                        }
                        {
                            this.state.list.length && !ttl ?
                                <EmptyView
                                    icon={<Icon icon="users"/>}
                                    text={
                                        <>
                                            Aucun membre trouvé pour <b>{this.state.name}</b>
                                        </>
                                    }
                                /> : null
                        }
                    </div>
                </div>
                <AuthBox
                    title="Réinitialisation mot de passe"
                    authenticate={false}
                    actionText="Modifier"
                    hint="Nouveau mot de passe"
                    open={this.state.showBox}
                    onSubmit={(password)=>{
                        this.password = password;
                        this.currentMan = this.state.showBox;
                        this.changeState({
                            showBox: 0,
                            showAuth: 0
                        });
                    }}
                    onAbort={()=>{
                        this.reset();
                        this.changeValue('showBox', 0);
                    }}
                />
                <AuthBox
                    open={this.state.showAuth}
                    title="Authentification"
                    onSubmit={(password)=>{
                        this.auth = password;
                        if(!this.password){
                            this.currentMan = this.state.showAuth;
                        }
                        this.submit();
                        this.changeValue('showAuth', 0);
                    }}
                    onAbort={()=>{
                        this.reset();
                        this.changeValue('showAuth', 0);
                    }}
                />
                <SpeedDial
                    sx={{ position: 'absolute', bottom: 70, right: 16 }}
                    icon={<SpeedDialIcon/>}
                    ariaLabel={"ok"}
                    onClick={()=>{
                       Route.pushState("/communauty/integration")
                    }}
                >
                </SpeedDial>
                {this.renderDialog()}
            </div>
        )
    }
}
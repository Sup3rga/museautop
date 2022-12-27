import React from 'react';
import Field from "../components/Field";
import Management from "../utils/Management";
import Ressources from "../utils/Ressources";
import Events from "../utils/Events";
import {Box, Button, LinearProgress} from "@mui/material";
import Route from "../utils/Route";
import Main from './Main';

export default class Login extends React.Component{

    constructor(props) {
        super(props);
        this.username = '';
        this.password = '';
        this.text = {
            errors: ["Veuillez remplir les champs correctement", "Une erreur est survénue lors de la requête"],
            message: ["Requête en cours...", "Compte authentifié !"]
        }
        this.state = {
            textError : this.text.errors[0],
            loader: this.text.message[0],
            loading: false,
            message: false
        };
        this.login = this.login.bind(this);
    }

    async login(){
        console.log({
            user: this.username,
            password: this.password
        })
        if(!this.username.length || !this.password.length){
            this.setState(state => { return {
                ...state,
                loader: null,
                textError:  this.text.errors[0],
                message: true
            }})
            // Events.emit("show-modal-box-alert");
            return;
        }
        this.setState(state => { return {
            ...state,
            loader: this.text.message[1],
            textError: null,
            message: true,
            loading: true
        }})
        // Events.emit("show-modal-box-loader");
        try {
            let result = await Management.connect(this.username, this.password)
            this.setState(state => { return {
                ...state,
                loader: this.text.message[1],
                textError: null,
                loading: false
            }});
            console.log('[Ok]');
            if(!result.error) {
                Events.emit('reset-view');
            }
        }catch(e){
            console.log('[Err]',this.state.loading);
            this.setState(state => { return {
                ...state,
                textError: e,
                loader: null,
                loading: false,
                message: true
            }})
            // Events
            //     .emit("close-modal-box-loader")
            //     .emit("show-modal-box-alert");
        }
    }

    render(){
        return (
            <>
                <div className="ui-container ui-size-fluid ui-fluid-vheight" id="login">
                    <div className="ui-container ui-size-fluid ui-fluid-height ui-all-center mask">
                        <div className="ui-container ui-size-fluid ui-md-size-5 box">
                            <div className="ui-container ui-size-fluid ui-all-center banner">
                                <div className="ui-container ui-size-2 logo"/>
                                <h1 className="ui-container">
                                    {Management.getProjectName()}
                                </h1>
                            </div>
                            <h2 className="ui-container ui-size-fluid ui-horizontal-center">Communauty management</h2>
                            <div className="ui-container ui-size-fluid wrapper">
                                <Field
                                    className="ui-element ui-size-fluid field"
                                    placeholder="Votre pseudo"
                                    onChange={(e)=>{
                                        this.username = e.target.value;
                                    }}
                                />
                            </div>
                            <div className="ui-container ui-size-fluid wrapper">
                                <Field
                                    className="ui-element ui-size-fluid field"
                                    placeholder="Mot de passe"
                                    type="password"
                                    toggled={true}
                                    onChange={(e)=>{
                                        this.password = e.target.value;
                                    }}
                                />
                            </div>
                            <div className="ui-container ui-size-fluid actions">
                                <button className="ui-element ui-button primary-theme" onClick={this.state.loading ? null : this.login}>Connexion</button>
                            </div>
                            {
                                !this.state.loading ? null :
                                (
                                    <div className="ui-container ui-size-fluid ui-absolute ui-bottom-close ui-left-close">
                                        <Box sx={{ width: '100%' }}>
                                            <LinearProgress />
                                        </Box>
                                    </div>
                                )
                            }
                        </div>
                        <div className="footer ui-container ui-size-fluid ui-horizontal-right ui-vertical-center ui-absolute ui-right-close ui-bottom-close">
                            &copy; 2022 Muse Au Top communauty !
                        </div>
                    </div>
                </div>
                <Main.DialogBox
                    title={null}
                    open={this.state.message}
                    content={
                        this.state.loader ? this.state.loader : this.state.textError
                    }
                    buttons={ this.state.loader ? null : [
                        <Button variant="text" onClick={()=>{
                            console.log('[Cool]')
                            this.setState(state => {
                                return {
                                    ...state,
                                    message: false
                                }
                            })
                        }}>Ok</Button>
                    ]}
                />
            </>
        );
    }
}
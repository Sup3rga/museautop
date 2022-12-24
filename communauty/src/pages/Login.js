import React from 'react';
import Field from "../components/Field";
import Management from "../utils/Management";
import Ressources from "../utils/Ressources";
import DialogBox from "../components/DialogBox";
import Events from "../utils/Events";

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
            loader: this.text.message[0]
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
                textError:  this.text.errors[0]
            }})
            Events.emit("show-modal-box-alert");
            return;
        }
        this.setState(state => { return {
            ...state,
            loader: this.text.message[1]
        }})
        Events.emit("show-modal-box-loader");
        try {
            let result = await Management.connect(this.username, this.password)
            this.setState(state => { return {
                ...state,
                loader: this.text.message[1]
            }});
            console.log('[Result]',result);
            if(!result.error) {
                Events.on('reset-view');
            }
        }catch(e){
            this.setState(state => { return {
                ...state,
                textError: e
            }})
            Events
                .emit("close-modal-box-loader")
                .emit("show-modal-box-alert");
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
                                <button className="ui-element ui-button primary-theme" onClick={this.login}>Connexion</button>
                            </div>
                        </div>
                        <div className="footer ui-container ui-size-fluid ui-horizontal-right ui-vertical-center ui-absolute ui-right-close ui-bottom-close">
                            &copy; 2022 Muse Au Top communauty !
                        </div>
                    </div>
                </div>
                <DialogBox role="loader" unmaskable={false}>
                    {this.state.loader}
                </DialogBox>
                <DialogBox role="alert">
                    <div className="ui-container ui-size-fluid ui-horizontal-left">
                        {this.state.textError}
                    </div>
                    <div className="ui-container ui-size-fluid ui-horizontal-right actions">
                        <button className="ui-element ui-button light"
                                onClick={()=>Events.emit("close-modal-box-alert")}
                        >Ok</button>
                    </div>
                </DialogBox>
            </>
        );
    }
}
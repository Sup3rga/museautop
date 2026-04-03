"use client";
import React from 'react';
import {DefaultPage} from "@/ui/site/components/Page";
import Field from "@/ui/site/components/Field";
import Footer from "@/ui/site/components/Footer";
import Filter from "@/ui/utils/Filter";
import Ressources from "@/ui/utils/Ressources";
import Constraint from "@/ui/utils/Constraint";
import {CircularProgress} from "@mui/material";
import {Icon} from "@/ui/site/components/Header";

export default class Contact extends React.Component{
    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            cli_fname: '',
            cli_lname: '',
            cli_mail: '',
            cli_msg: '',
            cli_bhid: window.currentBranch,
            requesting: false,
            message: null
        };
    }

    changeValue(index, value){
        this.setState(state=>{
            return {
                ...state,
                [index]: value
            }
        })
    }

    setResponseMessage(message, negative=false){
        this.changeValue('message', <div className="ui-container ui-fluid message ui-vertical-center">
            {!negative? null : <Icon icon="network-wired"/>}
            <div className="ui-element text">{message}</div>
            {negative? null : <Icon mode="ion" icon="android-done"/>}
        </div>)
    }

    reset(){
        this.setState({
            cli_fname: '',
            cli_lname: '',
            cli_mail: '',
            cli_msg: '',
            cli_bhid: window.currentBranch,
            requesting: false,
            message: null
        });
    }

    async submit(){
        this.changeValue('requesting', true);
        try {
            const response = await Ressources.sendMessage(Filter.object(this.state, [
                'cli_fname', 'cli_lname', 'cli_mail', 'cli_msg', 'cli_bhid'
            ]));
            this.changeValue('requesting', false);
            this.setResponseMessage("Merci de nous avoir contacté !");
        }catch (message){
            this.changeValue('requesting', false);
            this.setResponseMessage(message, true);
        }
        this.timer = setTimeout(()=>{
            this.reset();
        }, 3000);
    }
    componentDidMount() {

    }

    render() {
        const submitable = Filter.contains(this.state, ['cli_fname','cli_lname','cli_mail','cli_msg'], ['']);
        return (
          <DefaultPage>
                <div className="ui-container ui-wrap ui-md-unwrap ui-size-fluid contact-us ui-all-center">
                    <div className="ui-container ui-size-fluid ui-md-size-4 image ui-height-5 ui-md-fluid-height" style={{
                        backgroundImage: 'url(/assets/rapper.png)'
                    }}>
                        <div className="ui-container ui-size-fluid ui-fluid-height mask">

                        </div>
                    </div>
                    <div className="ui-container ui-size-fluid ui-md-size-6 form">
                        <h1>
                            Contactez-nous
                        </h1>
                        <p className="ui-container ui-size-fluid">
                            Nous sommes à l'écoute de ce que vous avez à nous dire !
                        </p>
                        {
                            this.state.requesting ?
                            <div className="ui-container ui-fluid ui-all-center loading">
                                <CircularProgress/>
                                <div className="ui-container ui-size-fluid text">
                                    Votre message est entrain de nous parvenir...
                                </div>
                            </div> :
                            this.state.message ?
                                this.state.message :
                                <div className="ui-container ui-size-fluid">
                                    <div className="ui-container ui-size-fluid ui-md-size-6 wrapper">
                                        <Field
                                            placeholder="Votre nom"
                                            className="ui-element ui-size-fluid field"
                                            value={this.state.cli_lname}
                                            onChange={(e)=>this.changeValue('cli_lname', Constraint.toFormalName(e.target.value))}
                                        />
                                    </div>
                                    <div className="ui-container ui-size-fluid ui-md-size-6 wrapper">
                                        <Field
                                            placeholder="Votre Prénom"
                                            className="ui-element ui-size-fluid field"
                                            value={this.state.cli_fname}
                                            onChange={(e)=>this.changeValue('cli_fname', Constraint.toFormalName(e.target.value))}
                                        />
                                    </div>
                                    <Field
                                        placeholder="Votre E-mail"
                                        className="ui-element ui-size-fluid field"
                                        value={this.state.cli_mail}
                                        onBlur={(e)=>{
                                            if(!Constraint.checkEmail(e.target.value)){
                                                this.changeValue('cli_mail', '')
                                            }
                                        }}
                                        onChange={(e)=>this.changeValue('cli_mail', e.target.value.toLowerCase())}
                                    />
                                    <Field
                                        placeholder="Votre Message"
                                        type="textarea"
                                        className="ui-element ui-size-fluid field plain"
                                        value={this.state.cli_msg}
                                        onChange={(e)=>this.changeValue('cli_msg', e.target.value)}
                                    />
                                    <div className="ui-container ui-size-fluid actions">
                                        <button className={"ui-element ui-button primary-theme "+(submitable ? '' : 'ui-disabled')}
                                                onClick={!submitable ? null : ()=>this.submit()}
                                        >Envoyer</button>
                                    </div>
                                </div>
                        }
                    </div>
                </div>
                <Footer/>
          </DefaultPage>
        );
    }
}
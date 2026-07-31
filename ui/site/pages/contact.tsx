"use client";
import {CircularProgress} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import Ressources from "@/ui/utils/Ressources";
import Filter from "@/ui/utils/Filter";
import {CheckCircle, MessageCircleWarning} from "lucide-react";

export default function ContactUs(){
    const [sending, setSending] = useState(false);
    const [sent, setSentStatus] = useState(false);
    const [error, setError] = useState<null|string>(null);
    const [state, setState] = useState<any>({
        cli_fname: '',
        cli_lname: '',
        cli_mail: '',
        cli_msg: '',
        cli_bhid: 1,
        cli_subject: ''
    });
    const change = useCallback((index : string)=>{
        return {
            value: state[index],
            onChange(e:any){
                setState((state)=>({
                    ...state,
                    [index] : e.target.value
                }))
            }
        }
    }, [state]);
    const submit = useCallback(async ()=>{
        if(!Filter.contains(state, [
            'cli_fname', 'cli_lname', 'cli_mail', 'cli_msg', 'cli_subject'
        ], ["", null, undefined])) return;
        try {
            setSending(true);
            const response = await Ressources.sendMessage(Filter.object(state, [
                'cli_fname', 'cli_lname', 'cli_mail', 'cli_msg', 'cli_bhid', 'cli_subject'
            ]));
            setSending(false);
            setSentStatus(true);
        }catch (message){
            setSending(false);
            setSentStatus(false);
            setError(message.toString() as string);
        }
        setTimeout(()=>{
            setState({
                cli_fname: '',
                cli_lname: '',
                cli_mail: '',
                cli_msg: '',
                cli_bhid: 1,
                cli_subject: '',
            });
            setError(null);
        }, 3000);
    }, [state]);

    return (
        <div id="contact" className="page">
            <div className="contact-layout flex! flex-col! lg:flex-row!">
                <div className="contact-left flex-[3]">
                    <div>
                        <p className="section-label mb-[24px]">04 — Nous écrire</p>
                        <h1 className="contact-title">Dites-<br/>nous <em>tout.</em></h1>
                        <p className="contact-desc">Une suggestion, une collaboration, un article que vous voulez voir
                            publié — on est là. Réponse sous 48 h.</p>
                    </div>

                    <div className="contact-info">
                        <div className="contact-info-item">
                            <div className="contact-info-icon">✉</div>
                            <div>
                                <p className="contact-info-label">Email</p>
                                <p className="contact-info-value">museautop@gmail.com</p>
                            </div>
                        </div>
                        <div className="contact-info-item">
                            <div className="contact-info-icon">📍</div>
                            <div>
                                <p className="contact-info-label">Basé à</p>
                                <p className="contact-info-value">Cap-Haitien, Haïti</p>
                            </div>
                        </div>
                        <div className="contact-info-item">
                            <div className="contact-info-icon">⏱</div>
                            <div>
                                <p className="contact-info-label">Délai de réponse</p>
                                <p className="contact-info-value">Sous 48 heures</p>
                            </div>
                        </div>
                    </div>

                    <div className="contact-socials hidden!">
                        <a className="social-link" href="#">ig</a>
                        <a className="social-link" href="#">tw</a>
                        <a className="social-link" href="#">yt</a>
                        <a className="social-link" href="#">fb</a>
                    </div>
                </div>
                <div className="contact-right flex-[2] relative">
                    <div className={`absolute ${sending || sent || error ? 'flex' : 'hidden'} justify-center flex-col gap-5 items-center top-0 bottom-0 left-0 right-0 backdrop-blur-xs`}>
                        {sending ? <CircularProgress color={"warning"}/> :
                            sent ? <CheckCircle width={70} color={"green"} height={70}/> :
                                error ? <MessageCircleWarning color={"darkred"} width={70} height={70}/> : null
                        }
                        <p>
                            {sending ? "Merci ! Votre message est en cours d'envoi." :
                                sent ? "Merci de nous avoir contacté ! Nous avons reçu votre message." :
                                    error ? error : ""
                            }
                        </p>
                    </div>
                    <p className="section-label mb-[40px]">Formulaire de contact</p>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Prénom</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Jean"
                                {...change('cli_fname')}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nom</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Dupont"
                                {...change('cli_lname')}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Adresse email</label>
                        <input className="form-input" type="email" placeholder="jean@exemple.com" {...change('cli_mail')}/>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Sujet</label>
                        <input className="form-input" type="text" placeholder="Proposition de collaboration, correction..." {...change('cli_subject')}/>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Message</label>
                        <textarea className="form-input form-textarea" placeholder="Écrivez votre message ici..." {...change('cli_msg')}></textarea>
                    </div>

                    <div className="form-submit">
                        <button className="btn-primary" onClick={submit}>Envoyer →</button>
                        <p className="form-note">Vos données ne sont jamais partagées.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
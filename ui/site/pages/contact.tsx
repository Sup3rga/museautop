export default function ContactUs(){
    return (
        <div id="contact" className="page">
            <div className="contact-layout">
                <div className="contact-left">
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
                                <p className="contact-info-value">contact@pulse-culture.com</p>
                            </div>
                        </div>
                        <div className="contact-info-item">
                            <div className="contact-info-icon">📍</div>
                            <div>
                                <p className="contact-info-label">Basé à</p>
                                <p className="contact-info-value">Port-au-Prince, Haïti</p>
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

                    <div className="contact-socials">
                        <a className="social-link" href="#">ig</a>
                        <a className="social-link" href="#">tw</a>
                        <a className="social-link" href="#">yt</a>
                        <a className="social-link" href="#">fb</a>
                    </div>
                </div>

                <div className="contact-right">
                    <p className="section-label mb-[40px]">Formulaire de contact</p>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Prénom</label>
                            <input className="form-input" type="text" placeholder="Jean"/>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nom</label>
                            <input className="form-input" type="text" placeholder="Dupont"/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Adresse email</label>
                        <input className="form-input" type="email" placeholder="jean@exemple.com"/>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Sujet</label>
                        <input className="form-input" type="text"
                               placeholder="Proposition de collaboration, correction..."/>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Message</label>
                        <textarea className="form-input form-textarea"
                                  placeholder="Écrivez votre message ici..."></textarea>
                    </div>

                    <div className="form-submit">
                        <button className="btn-primary">Envoyer →</button>
                        <p className="form-note">Vos données ne sont jamais partagées.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
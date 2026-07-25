"use client";

import Articles from "@/server/data/Articles";
import {useEffect, useMemo, useRef, useState} from "react";
import parser from "html-react-parser";
import Link from "next/link";
import Ressources from "@/ui/panel/utils/Ressources";
import {streaming} from "@/ui/lib/streamuing";
import { motion } from "framer-motion";
import {setVisites} from "@/app/(museautop)/actions";
import {ScrollAnalytics} from "@/ui/lib/scrollanalytics";
import DateTimeUtils from "@/lib/datetimeutils";

interface _ReadingProps{
    themes: string[],
    article: Articles,
    similars: Articles[]
}
const months = ["janv.", "fév.", "mars", "avr.", "mai", "juin", "juil.", "aout", "sept.", "oct.", "nov.", "déc."]
export default function Reading({themes, article, similars} : _ReadingProps){
    const ref = useRef(null);
    const allThemes = useMemo(()=>{
        const list = [...themes];
        for(const article of similars){
            list.push(...(article.theme.split(/ *, */)))
        }
        return list;
    }, [similars, themes]);
    const splitTitle = article.title.split(/ +/);
    const [viewLock, lockView] = useState(false);
    let images = 0;
    const dateutils = useMemo(()=> new DateTimeUtils(article.postOn), []);
    const analytics = useMemo(()=>new ScrollAnalytics(0.5,-1, ref), [ref]);
    streaming.init(Ressources.apis, {artid: article.id});

    useEffect(() => {
        analytics.watch(function(){
            if(this._ready && !viewLock){
                lockView(true);
                streaming.upstream({url: "/article/set/views"}).catch((err)=> {
                    console.log("Reading error : ", err);
                    lockView(false);
                })
            }
        });
    }, [viewLock]);

    useEffect(() => {
        setVisites({artid: article.id} as never).catch((err)=>console.log('[ERR]',err));
        return ()=>{
            analytics.dispose();
        }
    }, []);
    return (
    <div className={"w-full"}>
        <section className="article-hero">
            <div className="article-hero-left">
                <div>
                    <motion.div layoutId={`article-themes-${article.id}`} className="article-tag-line">
                        <span className="tag-category">{article.category.name}</span>
                        {themes.map((theme : string, key)=>(
                            <span className="tag-secondary" key={key}>{theme}</span>
                        ))}
                    </motion.div>

                    <h1 className="article-title">
                        {splitTitle.map((part: string, index : number)=>(
                            index == splitTitle.length - 1 ? <em key={index}>{part}</em> : `${part} `
                        ))}
                    </h1>
                    <p className="article-standfirst">
                        {article.resume}
                    </p>
                    <div className="article-meta-bar">
                        <div className="author-avatar">{`${article.createdBy.firstname[0].toUpperCase()}${article.createdBy.lastname[0].toUpperCase()}`}</div>
                        <div className="author-info">
                            <p className="author-name">{`${article.createdBy.firstname} ${article.createdBy.lastname}`}</p>
                            {/*<p className="author-role">Critique musical · Contributeur</p>*/}
                            <p className="author-role">Rédacteur</p>
                        </div>
                        <div className="meta-divider"></div>
                        <div className="meta-item">
                            <span className="meta-value">{dateutils.getDay()} {months[dateutils.getMonth()-1]}</span>
                            <span className="meta-label">{dateutils.getFullYear()}</span>
                        </div>
                        <div className="meta-divider"></div>
                        <div className="meta-item">
                            <span className="meta-value">{article.duration} min</span>
                            <span className="meta-label">lecture</span>
                        </div>
                        <div className="meta-divider"></div>
                        <div className="meta-item">
                            <span className="meta-value">
                                <streaming.ui.text url={"/article/get/stats"} filter={"views"} placeholder={article.stats.views}/>
                            </span>
                            <span className="meta-label">lectures</span>
                        </div>
                    </div>
                </div>
            </div>
            <motion.div layoutId={`article-image-${article.id}`} className="article-hero-right relative">
                <div className="hero-image-fill">
                    <span className="hero-image-placeholder">🎵</span>
                </div>
                <div className="hero-date-badge">
                    <span className="day">{dateutils.getDay()}</span>
                    <span className="month">{months[dateutils.getMonth()-1]} {dateutils.getFullYear()}</span>
                </div>
                <div className={"bg-cover absolute! article-image top-0 left-0 right-0 bottom-0 bg-red"} style={{backgroundImage: `url(${article.caption})`}}/>
                <div className="hero-image-caption bg-[#1a1410]/30 backdrop-blur-lg">
                    <p>Photo : Studio Lakay, Port-au-Prince</p>
                    <div className="hero-share-btns">
                        <button className="share-btn">tw</button>
                        <button className="share-btn">ig</button>
                        <button className="share-btn">lk</button>
                        <button className="share-btn">⎘</button>
                    </div>
                </div>
            </motion.div>
        </section>
        <div className="article-body-layout">
            <article className="article-content" id="article-content">
                <div className="w-full" ref={ref}>
                    {parser(article.content, {
                        replace: (el : any)=>{
                            if(el.name == 'figure' && el.children && el.attribs.class == "image"){
                                if(el.children[0].attribs.src == article.caption && images == 0){
                                    return <div/>;
                                }
                                images++;
                            }
                            return el;
                        }
                    })}
                </div>
                <div className="article-tags">
                    {allThemes.map((theme, key)=>(
                        <span className="article-tag-pill" key={key}>{theme}</span>
                    ))}
                </div>
                <div className="author-card">
                    <div className="author-card-avatar">{`${article.createdBy.firstname[0].toUpperCase()}${article.createdBy.lastname[0].toUpperCase()}`}</div>
                    <div>
                        <p className="author-card-name">{`${article.createdBy.firstname} ${article.createdBy.lastname}`}</p>
                        <p className="author-card-role">Rédacteur</p>
                        <p className="author-card-bio hidden">Jean-Marc Pierre couvre la scène musicale haïtienne et caribéenne depuis 2016. Il a collaboré avec plusieurs publications francophones et anime régulièrement des conférences sur l'identité culturelle en Haïti.</p>
                    </div>
                </div>
            </article>
            <article className="article-content hidden" id="article-content">
    
                <p className="drop-cap">
                    Il y a quelque chose d'inédit qui se passe dans les studios de Port-au-Prince. Quelque chose qui échappe aux catégories héritées, aux étiquettes figées, aux clivages entre générations. Une musique hybride est en train de naître — portée par des producteurs qui ont grandi avec le Konpa de leurs parents dans les oreilles et le trap d'Atlanta dans les téléphones.
                </p>
    
                <p>
                    Cette génération ne choisit pas entre les deux. Elle les fusionne, les distord, les réinvente. Et dans ce processus, elle pose une question culturelle profonde : que signifie être haïtien dans la musique aujourd'hui ?
                </p>
    
                <div className="content-image">
                    🎚️
                    <div className="content-image-caption">Studio d'enregistrement — Port-au-Prince, 2024</div>
                </div>
    
                <h2 id="section-1">Les racines du mouvement</h2>
    
                <p>
                    Tout commence vers 2018, quand une poignée de producteurs — dont plusieurs formés sur YouTube, SoundCloud, et les forums de beatmakers — commencent à expérimenter des fusions inédites. Le Konpa, avec ses rythmes syncopés et sa basse ronde, devient un terrain de jeu pour des 808, des hi-hats trap, des pads atmosphériques.
                </p>
    
                <p>
                    Le résultat n'est pas une imitation. C'est une revendication. Une façon de dire : nous pouvons être caribéens et contemporains, locaux et globaux, traditionnels et avant-gardistes — sans contradiction.
                </p>
    
                <div className="pull-quote">
                    <blockquote>
                        « Je voulais faire de la musique que mes grands-parents reconnaissent et que mes amis en diaspora puissent écouter en boîte. »
                    </blockquote>
                    <cite>— Misié Sadik, producteur, Port-au-Prince</cite>
                </div>
    
                <h2 id="section-2">L'influence de la diaspora</h2>
    
                <p>
                    La diaspora haïtienne joue un rôle central dans cette évolution. Les échanges entre la scène de Miami, de Montréal, de Paris et celle de Port-au-Prince ont créé un réseau informel mais puissant de diffusion musicale. Des sons circulent, des collaborations s'esquissent, des styles se contaminent positivement.
                </p>
    
                <div className="highlight-box">
                    <p>
                        À Montréal, le collectif <strong>Dézòd</strong> rassemble depuis 2020 une douzaine de producteurs haïtiens de la diaspora. Leurs productions, distribuées en ligne, ont atteint plusieurs millions d'écoutes — majoritairement depuis Haïti.
                    </p>
                </div>
    
                <p>
                    Ce n'est pas une rupture avec les aînés, insistent les principaux protagonistes. C'est une conversation. BélO lui-même, figure tutélaire de la musique haïtienne contemporaine, a salué publiquement le travail de ces jeunes producteurs, voyant dans leur démarche une continuité plutôt qu'une transgression.
                </p>
    
                <h2 id="section-3">Vers un son haïtien global</h2>
    
                <p>
                    La question qui se pose désormais est celle de la visibilité internationale. Des labels indépendants américains et européens commencent à s'intéresser à cette scène. Des festivals comme la WOMAD ou le Roskilde ont inclus des artistes haïtiens de cette nouvelle vague dans leurs programmations récentes.
                </p>
    
                <p>
                    Si la trajectoire de l'Afrobeats — né en Afrique de l'Ouest, désormais présent dans les charts mondiaux — peut servir de référence, il y a des raisons d'être optimiste. Le son haïtien hybride possède ce que les professionnels de l'industrie musicale appellent un "identity hook" : une identité sonore immédiatement reconnaissable, irréductible à un autre genre.
                </p>
                <div className="article-tags">
                    <span className="article-tag-pill">Musique</span>
                    <span className="article-tag-pill">Haïti</span>
                    <span className="article-tag-pill">Konpa</span>
                    <span className="article-tag-pill">Trap</span>
                    <span className="article-tag-pill">Identité</span>
                    <span className="article-tag-pill">Diaspora</span>
                    <span className="article-tag-pill">Production</span>
                    <span className="article-tag-pill">Jeunesse</span>
                </div>
                <div className="author-card">
                    <div className="author-card-avatar">JM</div>
                    <div>
                        <p className="author-card-name">Jean-Marc Pierre</p>
                        <p className="author-card-role">Critique musical & Contributeur</p>
                        <p className="author-card-bio">Jean-Marc Pierre couvre la scène musicale haïtienne et caribéenne depuis 2016. Il a collaboré avec plusieurs publications francophones et anime régulièrement des conférences sur l'identité culturelle en Haïti.</p>
                    </div>
                </div>
            </article>
            <aside className="article-sidebar">
                <div className="sidebar-sticky">
                    {/*<div className="reading-gauge">*/}
                    {/*    <span className="sidebar-section-label">Progression</span>*/}
                    {/*    <div className="gauge-bar-bg">*/}
                    {/*        <div className="gauge-bar-fill" id="gauge-fill"></div>*/}
                    {/*    </div>*/}
                    {/*    <div className="gauge-label">*/}
                    {/*        <span id="gauge-pct">0%</span>*/}
                    {/*        <span>0 min · <span id="gauge-remaining">{article.duration} min restantes</span></span>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <nav className="sidebar-toc hidden">
                        <span className="sidebar-section-label">Dans cet article</span>
                        <ol className="toc-list">
                            <li className="toc-item active" id="toc-0">
                                <a href="#section-1">
                                    <span className="toc-num">01</span>
                                    Les racines du mouvement
                                </a>
                            </li>
                            <li className="toc-item" id="toc-1">
                                <a href="#section-2">
                                    <span className="toc-num">02</span>
                                    L'influence de la diaspora
                                </a>
                            </li>
                            <li className="toc-item" id="toc-2">
                                <a href="#section-3">
                                    <span className="toc-num">03</span>
                                    Vers un son haïtien global
                                </a>
                            </li>
                        </ol>
                    </nav>
                    <div className={"hidden"}>
                        <span className="sidebar-section-label">Partager</span>
                        <div className="sidebar-share">
                            <button className="share-row-btn">
                                <span className="share-icon">tw</span> Twitter / X
                            </button>
                            <button className="share-row-btn">
                                <span className="share-icon">ig</span> Instagram
                            </button>
                            <button className="share-row-btn">
                                <span className="share-icon">⎘</span> Copier le lien
                            </button>
                        </div>
                    </div>
                    <div>
                        <span className="sidebar-section-label">Voir aussi</span>
                        <div>
                            {similars.map((similar, key)=>(
                                <Link key={key} href={`/articles/${similar.slug}`} className="sidebar-related-item">
                                    <div className="sidebar-related-thumb bg-cover!" style={{backgroundImage: `url(${similar.caption})`}}/>
                                    <div>
                                        <p className="sidebar-related-title">{similar.title}</p>
                                        <p className="sidebar-related-meta">{similar.category.name} · {similar.duration} min</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
    
                </div>
            </aside>
        </div>
        <section className="suggestions-section hidden">
            <div className="suggestions-header">
                <div>
                    <p className="suggestions-label">À lire ensuite</p>
                    <h2 className="suggestions-title">Sélectionnés pour vous</h2>
                </div>
                <p className="suggestions-algo-note">
                    Basé sur votre navigation<br/>
                    et le contenu de cet article
                </p>
            </div>

            <div className="suggestions-grid">
                <div className="suggestion-card featured">
                    <p className="suggestion-card-reason">Très populaire</p>
                    <p className="suggestion-card-tag">Portrait</p>
                    <h3 className="suggestion-card-title">BélO : l'éternité en trois accords — entretien exclusif</h3>
                    <div className="suggestion-card-meta">
                        <span>David F. · 12 min</span>
                        <span className="suggestion-score">score 0.91</span>
                    </div>
                </div>

                <div className="suggestion-card">
                    <p className="suggestion-card-reason">Même thématique</p>
                    <p className="suggestion-card-tag">Festival</p>
                    <h3 className="suggestion-card-title">Jacmel Jazz 2024 : le retour en grande pompe</h3>
                    <div className="suggestion-card-meta">
                        <span>Sophia R. · 5 min</span>
                        <span className="suggestion-score">score 0.78</span>
                    </div>
                </div>

                <div className="suggestion-card">
                    <p className="suggestion-card-reason">Dans vos tags favoris</p>
                    <p className="suggestion-card-tag">Opinion</p>
                    <h3 className="suggestion-card-title">Pourquoi le créole mérite une industrie musicale à part entière</h3>
                    <div className="suggestion-card-meta">
                        <span>Clara V. · 6 min</span>
                        <span className="suggestion-score">score 0.72</span>
                    </div>
                </div>

                <div className="suggestion-card">
                    <p className="suggestion-card-reason">Tendance cette semaine</p>
                    <p className="suggestion-card-tag">Analyse</p>
                    <h3 className="suggestion-card-title">Afrobeats vs Konpa : la bataille pour l'oreille africaine</h3>
                    <div className="suggestion-card-meta">
                        <span>Jean-Marc P. · 8 min</span>
                        <span className="suggestion-score">score 0.65</span>
                    </div>
                </div>

            </div>
        </section>
    </div>
    );
}
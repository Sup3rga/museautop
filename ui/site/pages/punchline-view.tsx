"use client";
import {motion} from "framer-motion"
import {Punchline} from "@/server/data/Punchlines"
import {useEffect} from "react";
import useStreamUIng from "@/ui/lib/streamuing";
import Ressources from "@/ui/panel/utils/Ressources";

interface _PunchlineViewProps{
    punchline: Punchline
}
export default function PunchlineView({punchline} : _PunchlineViewProps){
    const {StreamUI, upstream, request} = useStreamUIng(Ressources.apis, {punchid: punchline.id});
    useEffect(() => {
        // console.log('[Punchline]', punchline);
        console.log('[Result]', result);
        // FingerPrintJS.load().then((fp)=> fp.get()).then((result)=> console.log('[Result]', result))
        setTimeout(()=>{
            upstream({url: "/punchline/set/views"})
            .catch((err)=> console.log("Reading error : ", err))
        }, 5000);
    }, []);
    return (
        <div className="wrap punchline-view px-4!">
            <section className="main-punchline" id="decouvrir">
                <div>
                    <div className="eyebrow">Mixtape de punchlines</div>
                    <h1>Une <span className="redline">phrase</span><br/>peut <em>suffire</em>.</h1>
                    <p>Les meilleures barres, extraites, encadrées, prêtes à être likées. Une carte, une
                        punchline, un artiste — swipe et découvre la suite.</p>
                    <div className="hero-stats">
                        <div><b><StreamUI url={"/punchline/get/stats"} filter={"views"} placeholder={punchline.stats.views}/></b>fois vue</div>
                        <div><b><StreamUI url={"/punchline/get/stats"} filter={"likes"} placeholder={punchline.stats.likes}/></b>fois likée</div>
                    </div>
                </div>
                <div className="featured">
                    <img src={punchline.card}/>
                    <div className="featured-content">
                        {/*<div className="punch-text">J'ai troqué mes <mark>doutes</mark> contre des barres, le silence*/}
                        {/*    contre des rimes*/}
                        {/*</div>*/}
                        <div className="track-meta">
                            <div className="artist-line">
                                <div>
                                    <div className="artist-name">{punchline.artist}</div>
                                    <div className="track-title">{punchline.title}</div>
                                </div>
                            </div>
                            <button className="like-btn" onClick={request("/punchline/set/likes").except("Error::").call}>
                                <svg viewBox="0 0 24 24">
                                    <path
                                        d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2.3 4 6.2 4c2.1 0 3.7 1.2 4.8 2.7C12.1 5.2 13.7 4 15.8 4 19.7 4 21.6 8.1 20 11.7 19.5 15.4 12 21 12 21z"
                                        fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <div className="section-head">
                    <h2>Les barres du moment</h2>
                </div>
                <div className="grid" id="cardGrid">
                    {/*cards injected here*/}
                </div>
            </section>
            <section id="suggestions">
                <div className="section-head">
                    <h2>Pour toi</h2>
                    {/*<div className="refresh-btn" onClick={renderSuggestions()}>↻ Nouvelles suggestions</div>*/}
                </div>
                <div className="suggestions-row" id="suggRow"></div>
            </section>

        </div>
    )
}
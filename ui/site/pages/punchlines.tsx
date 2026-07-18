"use client";
import Punchlines from "@/server/data/Punchlines";
import {useEffect} from "react";
import Ressources from "@/ui/utils/Ressources";
import ExpandableCardDemo from "@/components/expandable-card-demo-standard";
import Link from "next/link";
import {motion} from "framer-motion";

interface _PunchlinesProps{
    punchlines: Punchlines[]
    years: Array<string|number>
    artists: string[]
}
export default function PunchlinesPage({punchlines, years, artists} : _PunchlinesProps){
    useEffect(() => {
        console.log("{{Data>>>", {punchlines, years, artists})
    }, []);
    return (
        <div id="punchlines" className="page bg-[#0d0d0d] text-[var(--paper)]">
            <section className="punch-hero">
                <div>
                    <p style={{
                        fontFamily: "var(--ff-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "rgba(245,240,232,0.3)",
                        marginBottom: "16px"
                    }}>03
                        — Punchline Cards</p>
                    <h1 className="punch-hero-title">Les mots<br/>qui <em>frappent.</em></h1>
                </div>
                <p className="punch-hero-desc">Extraits choisis, artistes célébrés. Une archive vivante des plus belles
                    punchlines.</p>
            </section>

            <div className="punch-sort">
                <span className="punch-sort-label">Trier par :</span>
                <button className="punch-sort-btn active">Récents</button>
                <button className="punch-sort-btn">Populaires</button>
                <button className="punch-sort-btn">Artiste</button>
                <button className="punch-sort-btn">Genre</button>
            </div>
            {/*<ExpandableCardDemo/>*/}
            <div className="punch-grid">
                {
                    punchlines.map((punchline, index)=>(
                        <Link key={punchline.id} href={`/punchlines/${punchline.id}`}>
                            <motion.div layoutId={"punchline"} className={`punch-card ${Ressources.isFibonnaciNumber(index + 1) ? 'large' : ''} accent-golds`}>
                                <div className="punch-card-deco">&ldquo;</div>
                                <div className="punch-card-body">
                                    <p className="punch-card-quote">
                                        {punchline.punchline}
                                    </p>
                                </div>
                                <div className="punch-card-footer">
                                    <div>
                                        <p className="punch-card-artist">{punchline.artist}</p>
                                        <p className="punch-card-song">{punchline.stats.views}</p>
                                    </div>
                                    <div className={"text-right"} >
                                        <span className="punch-card-genre">{punchline.category}</span>
                                        <p className="punch-card-like mt-[6px]">♥ {punchline.stats.likes}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))
                }
            </div>
            <div className="hidden">

                <div className="punch-card large accent-gold">
                    <div className="punch-card-deco">&ldquo;</div>
                    <div className="punch-card-body">
                        <p className="punch-card-quote">On voulait nous faire taire — on leur a répondu en musique, en
                            silence, et en beauté</p>
                    </div>
                    <div className="punch-card-footer">
                        <div>
                            <p className="punch-card-artist">BélO</p>
                            <p className="punch-card-song">Pawòl — Album Mizik Mwen 2021</p>
                        </div>
                        <div className={"text-right"} >
                            <span className="punch-card-genre">Roots</span>
                            <p className="punch-card-like mt-[6px]">♥ 214</p>
                        </div>
                    </div>
                </div>

                <div className="punch-card accent-red">
                    <div className="punch-card-deco">&ldquo;</div>
                    <div className="punch-card-body">
                        <p className="punch-card-quote">J'suis debout avant l'soleil, j'travaille pendant qu'tu dors</p>
                    </div>
                    <div className="punch-card-footer">
                        <div>
                            <p className="punch-card-artist">Misié Sadik</p>
                            <p className="punch-card-song">Réveil — 2023</p>
                        </div>
                        <div className={"text-right"}>
                            <span className="punch-card-genre">Rap Kreyòl</span>
                            <p className="punch-card-like mt-[6px]">♥ 98</p>
                        </div>
                    </div>
                </div>

                <div className="punch-card">
                    <div className="punch-card-deco">&ldquo;</div>
                    <div className="punch-card-body">
                        <p className="punch-card-quote">Mes racines poussent même sous le béton</p>
                    </div>
                    <div className="punch-card-footer">
                        <div>
                            <p className="punch-card-artist">Fantom 509</p>
                            <p className="punch-card-song">Rezistans — 2022</p>
                        </div>
                        <div className="text-right">
                            <span className="punch-card-genre">Trap</span>
                            <p className="punch-card-like mt-[6px]">♥ 76</p>
                        </div>
                    </div>
                </div>

                <div className="punch-card">
                    <div className="punch-card-deco">&ldquo;</div>
                    <div className="punch-card-body">
                        <p className="punch-card-quote">Chaque note que je joue est une prière que je n'ai pas su
                            dire</p>
                    </div>
                    <div className="punch-card-footer">
                        <div>
                            <p className="punch-card-artist">Beethova Obas</p>
                            <p className="punch-card-song">Lapriyè — 2019</p>
                        </div>
                        <div className="text-right">
                            <span className="punch-card-genre">Folklore</span>
                            <p className="punch-card-like mt-[6px]">♥ 143</p>
                        </div>
                    </div>
                </div>

                <div className="punch-card accent-gold">
                    <div className="punch-card-deco">&ldquo;</div>
                    <div className="punch-card-body">
                        <p className="punch-card-quote">La rue m'a tout appris — surtout à ne faire confiance qu'à la
                            mélodie</p>
                    </div>
                    <div className="punch-card-footer">
                        <div>
                            <p className="punch-card-artist">T-Vice</p>
                            <p className="punch-card-song">La Rue — Kompas 2020</p>
                        </div>
                        <div className="text-right">
                            <span className="punch-card-genre">Konpa</span>
                            <p className="punch-card-like mt-[6px]">♥ 189</p>
                        </div>
                    </div>
                </div>

                <div className="punch-card large">
                    <div className="punch-card-deco">&ldquo;</div>
                    <div className="punch-card-body">
                        <p className="punch-card-quote">Ils ont brûlé nos maisons mais pas nos chansons — elles vivent
                            dans la gorge de nos enfants</p>
                    </div>
                    <div className="punch-card-footer">
                        <div>
                            <p className="punch-card-artist">RAM</p>
                            <p className="punch-card-song">Fòs — Aibobo 2018</p>
                        </div>
                        <div className="text-right">
                            <span className="punch-card-genre">Vodou Jazz</span>
                            <p className="punch-card-like mt-[6px]">♥ 302</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
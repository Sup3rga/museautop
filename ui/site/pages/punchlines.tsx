"use client";
import Punchlines from "@/server/data/Punchlines";
import {useEffect} from "react";
import Ressources from "@/ui/utils/Ressources";
import ExpandableCardDemo from "@/components/expandable-card-demo-standard";
import Link from "next/link";
import {motion} from "framer-motion";
import {streaming} from "@/ui/lib/streamuing";
import PunchlineCard from "@/ui/site/components/PunchlineCard";

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
        <div className="wrap punchline-view px-4!">
            <section className="main-punchline" id="decouvrir">
                <div>
                    <motion.div layoutId={"punchline-hero-h1"} className="eyebrow">Mixtape de punchlines</motion.div>
                    <motion.h1 layoutId={"punchline-hero-h2"}>Une <span className="redline">phrase</span><br/>peut <em>suffire</em>.</motion.h1>
                    <motion.p layoutId={"punchline-hero-p"}>Les meilleures barres, extraites, encadrées, prêtes à être likées. Une carte, une
                        punchline, un artiste — swipe et découvre la suite.
                    </motion.p>
                    <motion.div layoutId={"punchline-stats"} className="hero-stats">
                        <div>
                            <b>
                                {/*<streaming.ui.text url={"/punchline/get/stats"} filter={"views"} placeholder={punchline.stats.views}/>*/}
                                {punchlines.length}
                            </b>
                            cartes
                        </div>
                        <div>
                            <b>
                                {/*<streaming.ui.text url={"/punchline/get/stats"} filter={"likes"} placeholder={punchline.stats.likes}/>*/}
                                {artists.length}
                            </b>
                            artistes
                        </div>
                    </motion.div>
                </div>
            </section>
            <section>
                <div className="section-head">
                    <h2>Les barres du moment</h2>
                </div>
                <div className="grid grid-cols-2! md:grid-cols-4! lg:grid-cols-5! xl:grid-cols-6!" id="cardGrid">
                    {
                        punchlines.map((punchline, index)=>(
                            <Link key={punchline.id} href={`/punchlines/${punchline.id}`}>
                                <motion.div layoutId={"punchline-"+punchline.id}>
                                    <PunchlineCard punchline={punchline} active={false}/>
                                </motion.div>
                            </Link>
                        ))
                    }
                </div>
            </section>
            {/*<section id="suggestions">*/}
            {/*    <div className="section-head">*/}
            {/*        <h2>Pour toi</h2>*/}
            {/*        /!*<div className="refresh-btn" onClick={renderSuggestions()}>↻ Nouvelles suggestions</div>*!/*/}
            {/*    </div>*/}
            {/*    <div className="suggestions-row" id="suggRow"></div>*/}
            {/*</section>*/}

        </div>
    )
}
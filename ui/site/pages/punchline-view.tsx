"use client";
import {motion} from "framer-motion"
import {Punchline} from "@/server/data/Punchlines"
import {useEffect} from "react";
import {streaming} from "@/ui/lib/streamuing";
import Ressources from "@/ui/panel/utils/Ressources";
import {setVisites} from "@/app/(museautop)/actions";
import PunchlineCard from "@/ui/site/components/PunchlineCard";


interface _PunchlineViewProps{
    punchline: Punchline
}
export default function PunchlineView({punchline} : _PunchlineViewProps){
    streaming.init(Ressources.apis, {punchid: punchline.id});
    useEffect(() => {
        console.log('[Punchline>>>', punchline);
        setVisites({"punchid": punchline.id}).catch((err)=>console.log('[Err]',err));
        setTimeout(()=>{
            streaming.upstream({url: "/punchline/set/views"})
            .catch((err)=> console.log("Reading error : ", err))
        }, 5000);
    }, []);
    return (
        <div className="wrap punchline-view px-4!">
            <section className="main-punchline main" id="decouvrir">
                <div>
                    <motion.div layoutId={"punchline-hero-h1"} className="eyebrow">Punchline</motion.div>
                    <motion.h1 layoutId={"punchline-hero-h2"}>Cette <span className="redline">phrase</span><br/>peut <em>suffire</em>.</motion.h1>
                    <motion.p layoutId={"punchline-hero-p"}>{punchline.comment}</motion.p>
                    <motion.div layoutId={"punchline-stats"} className="hero-stats">
                        <div>
                            <b>
                                <streaming.ui.text url={"/punchline/get/stats"} filter={"views"} placeholder={punchline.stats.views}/>
                            </b>
                            fois vue
                        </div>
                        <div>
                            <b>
                                <streaming.ui.text url={"/punchline/get/stats"} filter={"likes"} placeholder={punchline.stats.likes}/>
                            </b>
                            fois likée
                        </div>
                    </motion.div>
                </div>
                <motion.div layoutId={"punchline-"+punchline.id}>
                    <PunchlineCard punchline={punchline} className={"rotated"}/>
                </motion.div>
            </section>
            {/*<section>*/}
            {/*    <div className="section-head">*/}
            {/*        <h2>Les barres du moment</h2>*/}
            {/*    </div>*/}
            {/*    <div className="grid" id="cardGrid">*/}
            {/*        /!*cards injected here*!/*/}
            {/*    </div>*/}
            {/*</section>*/}
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
"use client";
import type Punchlines from "@/server/data/Punchlines";
import { motion } from "framer-motion";
import Link from "next/link";
export default function PunchlinePreview({punchline, className} : {punchline: Punchlines | string, className?: string}){
    punchline = (typeof punchline === "string" ? JSON.parse(punchline) : punchline) as Punchlines;
    return (
        <Link href={"/punchlines/"+punchline.slug}>
            <motion.div layoutId={"punchline-"+punchline.id} className={`mini-punch-card ${className}`}>
                <div className="mini-punch-card::before"></div>
                <p className="mini-punch-text">"{punchline.punchline}"</p>
                <p className="mini-punch-artist">{punchline.artist}</p>
                <p className="mini-punch-artist" style={{
                    fontSize: "0.6rem",
                    opacity:0.4,
                    marginTop: "2px",
                    fontFamily: "var(--ff-mono)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase"
                }}>{punchline.title} — {punchline.year}</p>
            </motion.div>
        </Link>
    )
}
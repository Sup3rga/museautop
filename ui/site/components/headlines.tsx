"use client";
import Link from "next/link";
import {motion} from "framer-motion";
import Articles from "@/server/data/Articles";

export default function Headlines({headLines} : {headLines: Articles | null}){
    return (
        <motion.div layoutId={`article-image-${headLines?.id}`} className="relative flex-[3] bg-cover bg-center" style={{backgroundImage: `url(${headLines?.caption ?? ""})`}}>
            <div className={"hero-featured absolute! bottom-0 top-0 left-0 right-0 opacity-50"}/>
            <div className={"absolute! flex flex-col p-3! text-[#f5f0e8] justify-end bottom-0 top-0 left-0 right-0"}>
                <p className="hero-featured-tag">✦ À la une</p>
                <h2 className="hero-featured-title">
                    {headLines?.title}
                </h2>
                <p className="hero-featured-meta">
                    Par {headLines?.createdBy?.firstname + " " + headLines?.createdBy?.lastname}. &nbsp;·&nbsp; {headLines?.duration} min de
                    lecture &nbsp;·&nbsp; {headLines?.category.name}
                </p>
                <Link className="btn-ghost text-white! p-4!" href={`/articles/${headLines?.slug}`}>Lire l&lsquo;article <span>→</span></Link>
            </div>
        </motion.div>
    )
}
"use client";

import Category from "@/server/data/Category";
import Articles from "@/server/data/Articles";
import Link from "next/link";
import AkaDatetime from "@/server/utils/AkaDatetime";
import {motion} from "framer-motion"

interface _ArticlesProps{
    totalArticles: number
    themes: string[]
    categories: Category[]
    articles: Articles[]
}
export default function ArticlesPage({totalArticles, themes, categories, articles} : _ArticlesProps){
    return (
        <div id="articles" className="page">
            <section className="articles-hero">
                <div className="articles-hero-inner">
                    <div>
                        <p className="section-label mb-[16px]">02 — Archives</p>
                        <h1 className="articles-hero-title">Tous les<br/><em>articles.</em></h1>
                    </div>
                    <div className={"text-right"}>
                        <p className="articles-count">{totalArticles} articles publiés</p>
                        <p className={"text-[0.8rem] text-[color:var(--muted)] font-[300]"}>Mis à jour en continu</p>
                    </div>
                </div>
            </section>

            <div className="filter-bar">
                <button className="filter-chip active">Tout</button>
                {
                    categories.map((category)=>(
                        <button className="filter-chip" key={category.id}>{category.name}</button>
                    ))
                }
            </div>

            <div className="articles-body">
                <div className="articles-list">
                    {
                        articles.map((article, key)=>(
                            <Link href={`/articles/${article.slug}`} className="article-row" key={article.id}>
                                <span className="article-row-num">{(key + 1).toString().padStart(2, '0')}</span>
                                <div className="article-row-body">
                                    <div className="article-row-content">
                                        <p className="article-row-tag">{article.category.name} · {article.theme}</p>
                                        <h3 className="article-row-title">{article.title}</h3>
                                        <p className="article-row-meta">{`${article.createdBy.firstname} ${article.createdBy.lastname}`} &nbsp;·&nbsp;
                                            {new AkaDatetime(article.createdAt).toD} &nbsp;·&nbsp;
                                            {article.duration} min.
                                        </p>
                                    </div>
                                    <motion.div layoutId={`article-image-${article.id}`} className={`article-row-img ${key == 0 ? 'first-image' : ''} bg-cover!`} style={{backgroundImage: `url(${article.caption})`}}/>
                                </div>
                            </Link>
                        ))
                    }
                </div>

                <aside className="articles-sidebar">
                    <div className="sidebar-section">
                        <h3 className="sidebar-title">Explorer par thème</h3>
                        <div className="sidebar-tags">
                            {themes.map((theme, key)=>(
                                <span className="tag-pill" key={key}>{theme}</span>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section hidden">
                        <h3 className="sidebar-title">Les plus lus</h3>
                        <div className="sidebar-recent">
                            <div className="sidebar-recent-item">
                                <div className="sidebar-recent-thumb">🎵</div>
                                <p className="sidebar-recent-title">Comment le Konpa digital est devenu une religion</p>
                            </div>
                            <div className="sidebar-recent-item">
                                <div className="sidebar-recent-thumb">🎤</div>
                                <p className="sidebar-recent-title">BélO : portrait d'un artiste intemporel</p>
                            </div>
                            <div className="sidebar-recent-item">
                                <div className="sidebar-recent-thumb">📖</div>
                                <p className="sidebar-recent-title">Dany Laferrière à l'Académie Française</p>
                            </div>
                            <div className="sidebar-recent-item">
                                <div className="sidebar-recent-thumb">🎬</div>
                                <p className="sidebar-recent-title">Cinéma haïtien : silence et résistance</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>

    )
}
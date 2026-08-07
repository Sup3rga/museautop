import Link from "next/link";
import Articles from "@/server/data/Articles";
import Punchlines from "@/server/data/Punchlines";
import Headlines from "@/ui/site/components/headlines";
import PunchlinePreview from "@/ui/site/components/punchline_preview";
import Ressources from "@/ui/utils/Ressources";
import {AdJsx} from "@/ui/site/partials/ads";

interface _HomeProps{
    lastArticles: Articles[]
    headLines: Articles | null
    lastPunchlines: Punchlines[]
    totalArticles: number
    totalPunchlines: number
}
export default function Home({lastArticles, headLines, lastPunchlines, totalPunchlines, totalArticles} : _HomeProps){

    // console.log('[Headlines>>>', headLines, lastArticles)
    return (
        <div id="home" className="page flex flex-col w-full bg-yellow-300">
            <section className="hero w-full lg:h-[50vh] flex flex-col lg:flex-row-reverse">
                <div className="hero-right md:h-auto h-[50vh] flex flex-col w-full lg:w-3/5">
                    <Headlines headLines={headLines}/>
                    <div className="hero-stats hidden! flex-[2]">
                        <div className="hero-stat">
                            <div className="hero-stat-number">{totalArticles}</div>
                            <div className="hero-stat-label">Articles publiés</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-number">{totalPunchlines}</div>
                            <div className="hero-stat-label">Punchlines archivées</div>
                        </div>
                    </div>
                </div>
                <div className="hero-left w-full lg:w-3/5">
                    <p className="hero-eyebrow">Actualités culturelles & musicales</p>
                    <h1 className="hero-title">Toujours au top<br/>de l'actualité <em>musicale.</em></h1>
                    <p className="hero-sub">Articles, analyses et extraits musicaux — pour ceux qui écoutent avant de
                        parler.</p>
                    <div className="hero-cta">
                        <Link className="btn-primary" href="/articles">Lire les articles</Link>
                        <Link className="btn-ghost" href="/punchlines">Punchlines <span>→</span></Link>
                    </div>
                </div>
            </section>

            <div className="divider"></div>

            <section className="recents lg:px-20! lg:py-16 p-4!">
                {lastArticles.length > 0 && (
                    <div className="recents-header flex! items-center!">
                        <h2 className="recents-title">Derniers articles</h2>
                        <Link className="link-all" href="/ArticlesPage">Tout voir →</Link>
                    </div>
                )}
                <AdJsx stage={"reading"} index={0}/>
                <div className="recents-grid grid grid-cols-1! gap-1 lg:grid-cols-3!">
                    {
                        lastArticles.map((article : any)=>(
                            <Link href={`/articles/${article.slug}`} className="article-card featured-card" key={article.id}>
                                <span className="article-tag">{article.category.name}</span>
                                <img
                                    src={article.caption}
                                    className={"rounded-md"}
                                />
                                <h3 className="article-card-title">{article.title}</h3>
                                <p className="article-card-excerpt">{article.resume}</p>
                                <div className="article-card-meta">
                                    <span>{`${article.createdBy.firstname} ${article.createdBy.lastname}`}</span> · {Ressources.getDate(article.postOn, 'dd/mm/yyyy')} · {article.duration} min
                                </div>
                            </Link>
                        ))
                    }
                </div>
            </section>
            <AdJsx stage={"footer"} index={0}/>
            <section className={`home-punch flex gap-8 items-center flex-col lg:flex-row! ${totalPunchlines ? '' : 'hidden'}`}>
                <div className="home-punch-left lg:flex-[1]!">
                    <p className="home-punch-label">✦ Punchline Cards</p>
                    <h2 className="home-punch-title">Les mots qui<br/>restent.</h2>
                    <p className="home-punch-sub">Des extraits soigneusement choisis, mis en scène pour qu'ils frappent
                        encore plus fort.</p>
                    <Link className="btn-outline-light" href="/punchlines">Explorer les cartes</Link>
                </div>
                <div className="home-punch-right lg:flex-[3]! grid grid-cols-1! lg:grid-cols-2! gap-2">
                    {
                        lastPunchlines.map((punchline, key)=>(
                            <PunchlinePreview punchline={JSON.stringify(punchline)} className={key == 3 ? "lg:col-span-2!" : ""} key={key}/>
                        ))
                    }
                </div>
            </section>

        </div>
    )
}
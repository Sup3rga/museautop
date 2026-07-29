import Link from "next/link";
import Articles from "@/server/data/Articles";
import Punchlines from "@/server/data/Punchlines";

interface _HomeProps{
    lastArticles: Articles[]
    headLines: Articles | null
    lastPunchlines: Punchlines
    totalArticles: number
    totalPunchlines: number
}
export default function Home({lastArticles, headLines, lastPunchlines, totalPunchlines, totalArticles} : _HomeProps){

    // console.log('[Headlines>>>', headLines, lastArticles)
    return (
        <div id="home" className="page flex flex-col w-full bg-yellow-300">
            <section className="hero w-full h-screen flex flex-col lg:flex-row-reverse">
                <div className="hero-right flex flex-col w-full lg:w-3/5">
                    <div className="relative flex-[3] bg-cover" style={{backgroundImage: `url(${headLines?.caption ?? ""})`}}>
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
                    </div>
                    <div className="hero-stats flex flex-[2]">
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
                    <h1 className="hero-title">La culture<br/>sans <em>filtre.</em></h1>
                    <p className="hero-sub">Articles, analyses et extraits musicaux — pour ceux qui écoutent avant de
                        parler.</p>
                    <div className="hero-cta">
                        <Link className="btn-primary" href="/articles">Lire les articles</Link>
                        <Link className="btn-ghost" href="/punchlines">Punchlines <span>→</span></Link>
                    </div>
                </div>
            </section>

            <div className="divider"></div>

            <section className="recents">
                {lastArticles.length > 0 && (
                    <div className="recents-header">
                        <h2 className="recents-title">Derniers articles</h2>
                        <Link className="link-all" href="/ArticlesPage">Tout voir →</Link>
                    </div>
                )}
                <div className="recents-grid grid grid-cols-1 gap-1 lg:grid-cols-3">
                    {
                        lastArticles.map((article : any)=>(
                            <Link href={`/articles/${article.slug}`} className="article-card featured-card" key={article.id}>
                                <span className="article-tag">{article.category.name}</span>
                                <h3 className="article-card-title">{article.title}</h3>
                                <p className="article-card-excerpt">{article.resume}</p>
                                <div className="article-card-meta">
                                    <span>{`${article.createdBy.firstname} ${article.createdBy.lastname}`}</span> · 18 nov. 2024 · {article.duration} min
                                </div>
                            </Link>
                        ))
                    }
                </div>
            </section>

            <section className="home-punch flex gap-8 items-center flex-col lg:flex-row">
                <div className="home-punch-left">
                    <p className="home-punch-label">✦ Punchline Cards</p>
                    <h2 className="home-punch-title">Les mots qui<br/>restent.</h2>
                    <p className="home-punch-sub">Des extraits soigneusement choisis, mis en scène pour qu'ils frappent
                        encore plus fort.</p>
                    <Link className="btn-outline-light" href="/punchlines">Explorer les cartes</Link>
                </div>
                <div className="home-punch-right grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className="mini-punch-card flex-[1]">
                        <div className="mini-punch-card::before"></div>
                        <p className="mini-punch-text">"J'suis debout avant l'soleil, j'travaille pendant qu'tu
                            dors"</p>
                        <p className="mini-punch-artist">Misié Sadik</p>
                        <p className="mini-punch-artist" style={{
                            fontSize: "0.6rem",
                            opacity:0.4,
                            marginTop: "2px",
                            fontFamily: "var(--ff-mono)",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase"
                        }}>Réveil — 2023</p>
                    </div>
                    <div className="mini-punch-card flex-[1]">
                        <p className="mini-punch-text">"Mes racines poussent même sous le béton"</p>
                        <p className="mini-punch-artist">Fantom 509</p>
                        <p className="mini-punch-artist" style={{
                            fontSize: "0.6rem",
                            opacity:0.4,
                            marginTop: "2px",
                            fontFamily: "var(--ff-mono)",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase"
                        }}>Rezistans — 2022</p>
                    </div>
                    <div className="mini-punch-card col-span-2" style={{gridColumn: "span 2"}}>
                        <p className="mini-punch-text">"On voulait nous faire taire — on leur a répondu en musique, en
                            silence, et en beauté"</p>
                        <p className="mini-punch-artist">BélO</p>
                        <p className="mini-punch-artist" style={{
                            fontSize: "0.6rem",
                            opacity:0.4,
                            marginTop: "2px",
                            fontFamily: "var(--ff-mono)",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase"
                        }}>Pawòl — 2021</p>
                    </div>
                </div>
            </section>

        </div>
    )
}
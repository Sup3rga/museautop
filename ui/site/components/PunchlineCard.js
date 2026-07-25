import {streaming} from "../../lib/streamuing";

export default function PunchlineCard({punchline, className="", active=true}){
    return (
        <div className={`featured ${className}`}>
            <img src={punchline.card}/>
            <div className="featured-content">
                <div className="track-meta">
                    <div className="artist-line">
                        <div>
                            <div className="artist-name">{punchline.artist}</div>
                            <div className="track-title">{punchline.title}</div>
                        </div>
                    </div>
                    <button className="like-btn" onClick={active ? streaming.request("/punchline/set/likes").except("Error::").call : null}>
                        <svg viewBox="0 0 24 24">
                            <path
                                d="M12 21s-7.5-4.6-10-9.3C.4 8.1 2.3 4 6.2 4c2.1 0 3.7 1.2 4.8 2.7C12.1 5.2 13.7 4 15.8 4 19.7 4 21.6 8.1 20 11.7 19.5 15.4 12 21 12 21z"
                                fill="currentColor"/>
                        </svg>
                        {active ? null : <span>{punchline.stats.likes}</span>}
                    </button>
                </div>
            </div>
        </div>
    )
}
import React from 'react';
import Link from "./Link";
import Ressources from "../utils/Ressources";

export default class ArticleThumbnail extends React.Component{

    render() {
        return (
            <div
                className={
                    "ui-container ui-size-fluid article-thumb ui-unwrap "+
                    this.props.className + " "+
                    (this.props.skeleton ? 'skeleton' : '')
                }
            >
                <div className="ui-element ui-size-6 ui-fluid-height ui-image image ui-vertical-top" style={{
                    backgroundImage: 'url('+this.props.caption+')'
                }}>
                </div>
                <div className="ui-container ui-unwrap ui-column ui-size-6 metadata">
                    <div className="ui-element ui-size-fluid title">{this.props.title}</div>
                    <div className="ui-element ui-size-fluid subtitle">{this.props.subtitle}</div>
                    <div className="ui-element ui-size-fluid date">{this.props.date}</div>
                </div>
            </div>
        );
    }
}

export class ArticlePreview extends React.Component{
    render() {
        let {title, caption, text, date, className, skeleton,id} = this.props,
            linkTitle = (title+"").replace(/ +/g, '+');
        return (
            <Link href={skeleton ? '' : '/articles/'+id+'/'+linkTitle} className={
                "ui-container ui-size-fluid article-preview "+
                className + " " +
                (skeleton ? 'skeleton' : '')
            }>
                <h1 className="ui-element ui-size-fluid">{title}</h1>
                <p className="ui-element ui-size-fluid text">
                    {text}
                </p>
                <div className="ui-element ui-size-fluid ui-image caption ui-image-first" style={{
                    backgroundImage: 'url('+caption+')'
                }}/>
                <div className="ui-element date">
                    {skeleton ? '' : Ressources.getDateString(date)}
                </div>
            </Link>
        );
    }
}
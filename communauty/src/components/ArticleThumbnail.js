import React from 'react';
import Link from "./Link";
import Ressources from "../utils/Ressources";
import Url from "../utils/Url";
import {Icon} from "./Header";

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
    renderAdmin(){
        let {
            title, caption, category,
            likes, reading, dislikes,
            createdBy, modifiedBy
        } = this.props;
        return (
            <div className="ui-element ui-size-fluid">
                <div className="ui-container ui-size-fluid ui-vertical-center">
                    {
                        !caption ? null :
                            <div className="ui-container caption ui-size-fluid ui-md-size-3" style={{
                                backgroundImage: 'url('+caption+')'
                            }}/>
                    }
                    <div className={"ui-container metadata  ui-size-"+(caption ? '9' : '12')}>
                        <div className="ui-container ui-size-fluid title ui-vertical-center">
                            {title}
                            <span className="ui-element category">{category.name}</span>
                        </div>
                        <div className="ui-container ui-size-fluid else ui-vertical-center">
                            <span className="ui-element">{createdBy.firstname+ ' ' +createdBy.lastname}</span>
                        </div>
                        {
                            !modifiedBy ? null :
                            <div className="ui-container ui-size-fluid else ui-vertical-center">
                                <label className="ui-element">Modifié par :</label>
                                <span className="ui-element">{modifiedBy.firstname+ ' ' +modifiedBy.lastname}</span>
                            </div>
                        }
                        <div className="ui-container ui-size-fluid grid stats ui-vertical-center">
                            <div className="ui-container item ui-vertical-center ui-unwrap">
                                <span className="ui-element label">{reading}</span>
                                vues
                            </div>
                            <div className="dot"/>
                            <div className="ui-container item ui-vertical-center ui-unwrap">
                                <span className="ui-element label">{likes}</span>
                                J'aime
                            </div>
                            <div className="dot"/>
                            <div className="ui-container item ui-vertical-center ui-unwrap">
                                <span className="ui-element label">{dislikes}</span>
                                Je n'aime pas
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderClient(){
        let {title, caption, text, date, skeleton} = this.props
        return (
            <>
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
            </>
        )
    }

    render() {
        let {title, className, skeleton,id,adminMod=false} = this.props,
            linkTitle = (title+"").replace(/ +/g, '+');
        const link = /^\/(writing|draft)/.test(Url.get()) ? '/writing/new/'+id : '/articles/'+id+'/'+linkTitle;
        return (
            <Link href={skeleton ? '' : link} className={
                "ui-container ui-size-fluid article-preview "+
                className + " " +
                (skeleton ? 'skeleton' : '')
            }>
                {adminMod ? this.renderAdmin() : this.renderClient()}
            </Link>
        );
    }
}
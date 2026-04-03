"use client";
import React from 'react';
import {DefaultPage} from "@/ui/site/components/Page";
import Ressources from "@/ui/utils/Ressources";
import Footer from "@/ui/site/components/Footer";
import Url from "@/ui/utils/Url";
import {Icon} from "@/ui/site/components/Header";
import parser from "html-react-parser";
import {CircularProgress} from "@mui/material";

export default class Reading extends React.Component{

    constructor(props) {
        super(props);
        let url = Url.get().split('/');
        this.data = {
            id: url[2],
            title: url[3].replace(/\+/g,' ')
        };
        this.likes = Ressources.getLocalStorage('likedArticles', true);
        this.dislikes = Ressources.getLocalStorage('dislikedArticles', true);
        this.state = {
            id: 0,
            title: null,
            content: null,
            postOn: null,
            stats: [],
            author: null,
            rated: false,
            like: false,
            pending: false,
        };
    }

    componentDidMount() {
        Ressources.getArticleData(this.data.id)
        .then((e)=>{
            this.setState(e);
        });
    }

    changeState(state){
        this.setState(old => {
            return {
                ...old,
                ...state
            }
        });
    }

    async rate(positive){
        this.changeState({
            pending: true,
            like: positive
        });
        let rated = false;
        if(await Ressources.rateArticle(this.state.id, positive)){
            rated = true;
            if(positive) {
                this.likes.push(this.state.id);
                Ressources.setLocalStorage('likedArticles', this.likes);
            }
            else{
                this.dislikes.push(this.state.id);
                Ressources.setLocalStorage('dislikedArticles', this.dislikes);
            }
        }
        this.changeState({
            pending: false,
            rated
        });
    }

    renderArticle(){
        let skeleton = this.state.title === null;
        return (
            <div className="ui-container ui-size-fluid article-read">
                <div className="ui-container ui-size-fluid ui-md-size-8">
                    <h1 className={
                        "ui-container ui-size-fluid "+
                        (skeleton ? 'skeleton' : '')
                    }>
                        {this.state.title}
                    </h1>
                    <div className="ui-container ui-size-fluid">
                        <div className={
                            "ui-element ui-size-fluid date " +
                            (skeleton ? 'skeleton' : '')
                        }>
                            {
                                skeleton ? '':
                                    'Publié le '+ Ressources.getDateString(this.state.postOn, false)
                            }
                        </div>
                    </div>
                    <div className="ui-element ui-size-fluid article-reader">
                        {
                            skeleton ?
                                Ressources.range(0,Math.random() * 60 + 10).map((i,j)=>{
                                    return <p className="ui-container ui-size-fluid skeleton" style={{
                                        width: (Math.random() * 100 + 10)+'%'
                                    }} key={j}/>;
                                }) :
                                parser(this.state.content)
                        }
                    </div>
                </div>
            </div>
        );
    }

    renderAppreciationBox(){
        let skeleton = this.state.title === null;
        return (
            skeleton ?

                <div className="ui-container ui-size-fluid appreciation ui-vertical-center">
                    <span className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 text skeleton">
                    </span>
                    <button className="ui-element ui-button skeleton">
                    </button>
                    <button className="ui-element ui-button skeleton">
                    </button>
                </div>
                :
                <div className="ui-container ui-size-fluid appreciation ui-vertical-center">
                    {
                        this.likes.indexOf(this.state.id) >= 0 ||
                        this.dislikes.indexOf(this.state.id) >= 0 ?
                            <div className="ui-container feedback">
                                <div className="ui-container ui-size-fluid message">
                                    {this.likes.indexOf(this.state.id) >= 0 ?
                                        `
                                        Nous vous remercions pour votre appréciation ! C'est un plaisir 
                                        d'écrire pour des gens comme vous !    
                                        `:
                                        `
                                        Votre note nous sera très utile, merci de nous avoir fait
                                        connaître votre avis.
                                        `
                                    }
                                </div>
                                <div className="ui-container ui-size-fluid name">
                                    De la redaction
                                </div>
                            </div>:
                            <>
                                <span className="ui-container ui-size-fluid ui-sm-size-6 ui-md-size-4 text">
                                    Vous avez aimé cet article ?
                                </span>
                                <button
                                    disabled={this.state.pending}
                                    className={
                                        "ui-element ui-button primary-theme "+
                                        (this.state.pending && !this.state.like ? 'ui-disabled' : '')
                                    }
                                    onClick={()=>this.rate(true)}
                                >
                                    {
                                        this.state.pending && this.state.like ?
                                            <CircularProgress size="18px" sx={{color: 'white'}}/> :
                                            <Icon icon="thumbs-up"/>
                                    }
                                    J'ai apprécié !
                                </button>
                                <button
                                    disabled={this.state.pending}
                                    className={
                                        "ui-element ui-button ui-alert-theme ui-text-clipped "+
                                        (this.state.pending && this.state.like ? 'ui-disabled' : '')
                                    }
                                    onClick={()=>this.rate(false)}
                                >
                                    {
                                        this.state.pending && !this.state.like ?
                                            <CircularProgress size="18px" sx={{color: 'white'}}/> :
                                            <Icon icon="grin-wink"/>
                                    }
                                    J'espérais mieux
                                </button>
                            </>
                    }
                </div>
        );
    }

    render() {
        console.log('[THis]',this);
        return (
            <DefaultPage title={this.data.title}>
                {this.renderArticle()}
                {this.renderAppreciationBox()}
                <Footer/>
            </DefaultPage>
        );
    }
}
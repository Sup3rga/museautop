"use client";
import React from 'react';
import Header, {Icon} from "@/ui/site/components/Header";
import Ressources from "@/ui/utils/Ressources";
import {DefaultPage} from "@/ui/site/components/Page";
import Body from "@/ui/site/components/Body";
import ArticleThumbnail, {ArticlePreview} from "@/ui/site/components/ArticleThumbnail";
import Footer from "@/ui/site/components/Footer";
import Drawer from "@/ui/site/components/Menu";
import Field from "@/ui/site/components/Field";
import Events from "@/ui/utils/Events";
import FilterBox from "@/ui/site/components/FilterBox";

export default class Articles extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            categories: {},
            articles: Ressources.getArticlesFakeData(),
            currentCategorie: 0,
            seemore: false,
        };
    }

    componentDidMount() {
        Ressources.getArticleCategories().then((e)=>{
            this.setState((state)=>{
                return {
                    ...state,
                    categories: e
                }
            })
        });
        Events.on('filter-change', (filter)=>{
            this.setState((state)=>{
                return {
                    ...state,
                    currentCategorie: filter
                }
            });
        })
        .on('scroll', (e)=>{
            if(e.top > 60){
                Events.emit("show-header-icon",'filter')
            }
            else{
                Events.emit("hide-header-icon",'filter')
            }
        })
        setTimeout(()=>{
            Ressources.getArticles().then((result)=>{
               this.setState((state)=>{
                   return {
                       ...state,
                       articles: result
                   }
                });
            });
        },2000);
    }

    render(){
        return (
            <>
                <FilterBox className="filter-box" default={this.state.currentCategorie} categories={this.state.categories}/>
                <DefaultPage>
                    <div className="ui-container ui-size-fluid type-chooser ui-vertical-center">
                        {FilterBox.content(this.state.categories, this.state.currentCategorie)}
                    </div>
                    <div className="ui-container ui-size-fluid">

                    </div>
                    <div className="ui-container ui-size-fluid ui-horizontal-center">
                        <div className="ui-container ui-size-fluid ui-sm-size-10 ui-md-size-8 ui-lg-size-6  articles-container ui-horizontal-left">
                            {
                                this.state.articles.map((article,index)=>{
                                    if(article.title !== null){
                                        this.state.seemore = true;
                                    }
                                    console.log('[Current]',this.state.currentCategorie, article.category);
                                    if([article.category ? article.category.id : 0, 0].indexOf(this.state.currentCategorie * 1) < 0 && article.title !== null){
                                        return;
                                    }
                                    return (
                                        <ArticlePreview
                                            key={index}
                                            id={article.id}
                                            skeleton={article.title === null}
                                            title={article.title}
                                            text={Ressources.text(article.content)}
                                            caption={article.caption}
                                            date={article.postOn}
                                        />
                                    )
                                })
                            }
                        </div>
                        {
                            // this.state.seemore ?
                            // <div className="ui-container ui-all-center ui-size-fluid">
                            //     <button className="ui-element ui-button light" id="see-more-article">Voir plus <Icon icon="arrow-down"/></button>
                            // </div>:
                            null
                        }
                    </div>
                    <Footer simple={true} />
                </DefaultPage>
            </>
        )
    }
}
"use client";
import React from 'react';
import Header, {Icon} from "@/ui/site/components/Header";
import Ressources from "@/ui/utils/Ressources";
import Page, {DefaultPage} from "@/ui/site/components/Page";
import Body from "@/ui/site/components/Body";
import Caroussel, {CarousselSlide} from "@/ui/site/components/Caroussel";
import ArticleThumbnail from "@/ui/site/components/ArticleThumbnail";
import Footer from "@/ui/site/components/Footer";
import Drawer from "@/ui/site/components/Menu";
import SearchPanel from "@/ui/site/components/SearchPanel";
import {Punchline} from "./Punchlines";
import parser from "html-react-parser";

export default class Home extends React.Component{
    
    constructor(props){
        super(props);
        this.state = {
            trending: Ressources.getArticlesFakeData(),
            slides: Ressources.getSlidesDataFakeData(),
            punchlines: Ressources.getLastPunchLinesDataFakeData()
        }
    }

    componentDidMount() {
        Ressources.getArticles().then((result)=>{
            this.setState((state)=>{
                return {
                    ...state,
                    trending: result
                }
            });
        });
        Ressources.getSlidesData().then((result)=>{
            this.setState((state)=>{
                return {
                    ...state,
                    slides: result
                }
            });
        });
        Ressources.getLastPunchLinesData().then((result)=>{
            this.setState((state)=>{
                return {
                    ...state,
                    punchlines: result
                }
            });
        });
    }

    render(){
        return <DefaultPage>
                <Body>
                    <Caroussel>
                        {
                            this.state.slides.map((data, index) => {
                                return <CarousselSlide skeleton={data.title === null} key={index} image={data.caption}>
                                    <h1 className="ui-element ui-size-fluid">{data.title}</h1>
                                    <p className="ui-element ui-size-fluid">{Ressources.text(data.content)}</p>
                                    <button className="ui-element ui-button primary-theme">
                                        Lire la suite <Icon icon="long-arrow-alt-right"/>
                                    </button>
                                </CarousselSlide>;
                            })
                        }
                    </Caroussel>
                    <div className="ui-container ui-unwrap ui-column ui-md-row ui-horizontal-right ui-size-fluid article-thumb-space">
                        <div className="article-container ui-element ui-horizontal-left ui-size-fluid ui-md-size-8">
                            <h1 className="ui-element ui-size-fluid">Tendances</h1>
                            <div className="ui-element ui-size-fluid trending">
                                {
                                    this.state.trending.map((data,index) =>{
                                        return <ArticleThumbnail
                                            skeleton={data.title === null}
                                            key={index}
                                            caption={data.caption}
                                            title={data.title}
                                            subtitle={Ressources.text(data.content)}
                                            date={Ressources.getDateString(data.postOn, false)}
                                        />
                                    })
                                }
                            </div>
                        </div>
                        <div className="puncline-container ui-vertical-top ui-sm-unwrap ui-wrap ui-row ui-container ui-size-fluid ui-md-size-4">
                            <h1 className="ui-element ui-size-fluid ui-horizontal-center">Les dernières punchlines</h1>
                            {
                                this.state.punchlines.map((img,index)=>{
                                    return <Punchline className="ui-size-fluid" data={img} key={index}/>
                                })
                            }
                        </div>
                    </div>
                    <div className="ui-container ui-size-fluid bottom-gradient">
                        <div className="ui-container ui-size-fluid about-us ui-unwrap ui-vertical-center ui-horizontal-right ui-no-scroll ui-md-vheight-8">
                            <div className="ui-container ui-size-8 ui-absolute symbol ui-fluid-height">
                                <div className="ui-element ui-size-fluid ui-image image ui-fluid-height" style={{
                                    backgroundImage: 'url(./assets/rapper.png)'
                                }}/>
                            </div>
                            <div className="ui-container ui-vertical-center ui-relative ui-fluid-height ui-size-12 ui-horizontal-right text ui-fluid-height">
                                <div className="ui-element ui-horizontal-center ui-size-6 ads">
                                    <h1>Cherchez vous un partenaire médiatique ?</h1>
                                    <p>
                                        {Ressources.getSelfAdsText()}
                                    </p>
                                    <div className="ui-container ui-size-fluid ui-action">
                                        <button className="ui-element ui-button primary-theme">Écrivez-nous pour vous lancer !</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="ui-container ui-size-fluid newsletter ui-md-all-center">
                            <h2 className="ui-element ui-size-fluid ui-md-size-4 ui-horizontal-left">
                                Voulez-vous ne rien râter dans l'actualité ?
                            </h2>
                            <div className="ui-container ui-size-fluid ui-md-size-8 ui-lg-size-6 field">
                                <input className="ui-container ui-size-10 ui-md-size-11" type="email" placeholder="Votre adresse e-mail"/>
                                <button className="ui-element ui-size-2 ui-md-size-1 primary-theme">
                                    <Icon icon="envelope-open-text"/>
                                </button>
                            </div>
                        </div>
                        <Footer className="footer-home" />
                    </div>
                </Body>
            </DefaultPage>;
    }
}
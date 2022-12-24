import React from 'react';
import Ressources from "../utils/Ressources";
import {Icon, Li} from "./Header";

export default class Footer extends React.Component{

    render() {
        let {simple} = this.props;
        simple = simple == null ? false : simple;
        return (
            <footer className={"ui-container ui-size-fluid " + this.props.className}>
                {
                    simple ? null :
                    <div className="ui-container ui-unwrap ui-spaced ui-column ui-md-row ui-size-fluid links">
                        {
                            Ressources.getFooterLinks().map((element, index) => {
                                return <div
                                    key={index}
                                    className="ui-container ui-column ui-unwrap ui-size-fluid ui-md-size-4 ui-lg-size-3 ui-horizontal-center links-box">
                                    {
                                        Object.keys(element).map((index, key)=>{
                                            return <Li key={key} href={index}>{element[index]}</Li>
                                        })
                                    }
                                </div>
                            })
                        }
                    </div>
                }
                <div className="ui-container ui-size-fluid ui-vertical-center end">
                    {
                        simple ? null :
                        <div className="ui-container ui-unwrap ui-all-center ui-size-fluid ui-md-size-4 social-box">
                            {
                                Ressources.getSocialMediaLinks().map((data,index)=>{
                                    return <a href={data.link} key={index} title={data.title} className="ui-element ui-flex ui-all-center social-icon">
                                        <Icon icon={data.icon}/>
                                    </a>
                                })
                            }
                        </div>
                    }
                    <div className={
                        "ui-container ui-all-center copyright ui-size-fluid " +
                        (simple ? "" : "ui-md-size-4")
                    }>
                        &copy; Tous droits réservés - Rap Au Top 2022
                    </div>
                </div>
            </footer>
        );
    }
}
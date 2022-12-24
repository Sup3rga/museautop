import React from 'react';
import {Icon, Li} from "./Header";
import Ressources from "../utils/Ressources";
import Events from "../utils/Events";
import OverLayer from "./OverLayer";

export default class Drawer extends OverLayer{
    static active = false;
    constructor(props) {
        super(props);
        super.eventName = [
            'open-search',
            'close-search',
            'search-transition-end'
        ];
        this.state = {
            open: false
        };
        super.setEventNames([
            'open-menu',
            'close-menu',
            'menu-transition-end'
        ]);
    }

    render() {
        let links = Ressources.links;
        return (
            <menu className={
                "ui-container ui-unwrap ui-fixed ui-left-close ui-size-fluid ui-fluid-vheight "+
                this.props.className+" "+
                (this.state.open ? 'open' : '')
            }>
                <div className="ui-container ui-fluid-height ui-absolute ui-left-close drawer-img ui-size-12">
                </div>
                <div className="ui-container ui-size-12 ui-column ui-fluid-height drawer ui-relative">
                    <div className="ui-container ui-size-fluid panel">
                        <div className="ui-container ui-vertical-center ui-size-fluid">
                            <Icon icon="arrow-left" onClick={()=>{
                                Events.emit('close-menu');
                            }} />
                            <span className="ui-element name">
                                {Ressources.getProjectName()}
                            </span>
                        </div>
                    </div>
                    <div className="ui-container ui-size-fluid">
                        {
                            Object.keys(links).map((href, index) => {
                                return <Li href={href} key={index} className="ui-element ui-size-fluid">
                                    {links[href]}
                                </Li>
                            })
                        }
                    </div>
                </div>
            </menu>
        );
    }
}
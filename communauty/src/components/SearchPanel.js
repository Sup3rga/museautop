import React from 'react';
import OverLayer from "./OverLayer";
import {Icon} from "./Header";
import Field from "./Field";
import Events from "../utils/Events";

export default class SearchPanel extends OverLayer{

    constructor(props) {
        super(props);
        this.state = {
            open: false
        }
        super.setEventNames([
            'open-search',
            'close-search',
            'search-transition-end'
        ])
    }

    render() {
        return (
            <div className={
                "ui-container ui-fixed ui-size-fluid ui-right-close ui-fluid-vheight search-panel "+
                this.props.className+" "+
                (this.state.open ? 'open' : '')
            }>
                <div className="ui-container ui-size-fluid ui-wrap ui-all-center head">
                    <Icon icon="arrow-left" onClick={e => {
                        Events.emit("close-search");
                    }}/>
                    <Field className="ui-size-10 field" placeholder="Recherchez quelque chose" onChange={e => {
                        console.log('[E]',e);
                    }}/>
                </div>
                <div className="ui-container ui-size-fluid ui-all-center">

                </div>
            </div>
        );
    }
}
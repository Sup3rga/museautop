import React from 'react';
import OverLayer from "./OverLayer";
import Events from "../utils/Events";

export default class DialogBox extends OverLayer {
    constructor(props) {
        super(props);
        let {events,role} = this.props,
            defaultEvents = [
                'show-modal-box',
                'close-modal-box',
                'mb-transition-end'
            ];
        if(role){
            for(let i in defaultEvents){
                defaultEvents[i] += "-"+role;
            }
        }
        super.setEventNames(events ? events : defaultEvents);
        this.state = {
            open: false
        };
    }


    render() {
        let {unmaskable} = this.props;
        unmaskable = unmaskable != null ? unmaskable : true;
        return (
            <div {...this.props} className={
                "ui-container dialog-box ui-absolute ui-all-center " +
                (this.props.className | null) +
                (this.state.open ? ' open' : '')
            }>
                <div className="ui-container ui-size-fluid ui-fluid-height mask ui-all-close ui-absolute"
                    onClick={()=>!unmaskable ? null : Events.emit(this.eventName[1])}
                />
                <div className="ui-container ui-size-9 ui-md-size-4 box">
                    {this.props.children}
                </div>
            </div>
        );
    }
}
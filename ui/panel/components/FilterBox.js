import React from 'react';
import OverLayer from "./OverLayer";
import Field from "./Field";
import Events from "../utils/Events";

export default class FilterBox extends OverLayer{
    constructor(props) {
        super(props);
        super.setEventNames([
            'show-filter-box',
            'close-filter-box',
            'fb-transition-end'
        ]);
        this.filter = props.default;
        this.state = {
            open: false,
            filter: this.filter
        };
    }

    componentDidMount() {
        super.componentDidMount();
        Events.on('filter-change', (e)=>{
            this.filter = e;
            this.setState((state)=>{
                return {
                    ...state,
                    filter: this.filter
                }
            })
        })
    }

    static content(categories, def){
        this.filter = def || this.filter;
        console.log('[Def]',def);
        return (
            <>
                <label>Catégories</label>
                <Field type="select"
                       className="ui-size-6 ui-md-size-3 field"
                       placeholder="Cat" options={categories}
                       value={this.filter}
                       onChange={e=>{
                           this.filter = e.target.selectedOptions[0].value;
                       }}
                />
                <button className="ui-element ui-button primary-theme" onClick={(e)=>{
                    Events.emit("filter-change", this.filter).emit('close-filter-box');
                }}>Filtrer</button>
            </>
        );
    }

    render() {
        return (
            <div className={
                "ui-modal " +
                this.props.className + " " +
                (this.state.open ? 'open' : '')
            }>
                <div className="ui-mask" onClick={()=>{
                    Events.emit("close-filter-box");
                }}/>
                <div className="ui-container ui-box ui-size-8 ui-md-size-4 ui-lg-size-3">
                    {FilterBox.content(this.props.categories, this.state.filter)}
                </div>
            </div>
        );
    }
}
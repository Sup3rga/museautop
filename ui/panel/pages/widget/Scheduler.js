import React from 'react';
import {Grid, Switch, TextField} from "@mui/material";

export default class Scheduler extends React.Component{
    constructor(props) {
        super(props);
        this.onChange = props.onChange ? props.onChange : ()=>{};
        this.text = {
            auto: props.autoText ? props.autoText : 'Publier automatiquement',
            manual: props.manualText ? props.manualText : 'Publier à'
        }
        this.timer = null;
        const {auto = false, date = '', time = ''} = props;
        this.state = { auto, date, time}
    }

    updateData(index,value){
        this.setState(state=>{
            return {
                ...state,
                [index] : value
            }
        });
        this.timer = setTimeout(()=>{
            clearTimeout(this.timer);
            this.onChange(this.state);
        }, 200);
    }

    render(){
        return (
            <>
                <div className="ui-container ui-size-fluid ui-vertical-center">
                    <Switch checked={this.state.auto}
                            onChange={(e)=>{
                                this.updateData('auto', e.target.checked);
                            }}
                    />
                    <label>{this.text[this.state.auto ? 'auto' : 'manual']}</label>
                </div>
                {
                    this.state.auto ? null :
                        <div className={"flex gap-1"}>
                            <TextField
                                className="ui-container ui-size-fluid"
                                type="date"
                                value={this.state.date}
                                onChange={(e)=>{
                                    this.updateData('date', e.target.value);
                                }}
                            />
                            <TextField
                                className="ui-container ui-size-fluid"
                                type="time"
                                value={this.state.time}
                                onChange={(e)=>{
                                    this.updateData('time', e.target.value);
                                }}
                            />
                        </div>
                }
            </>
        )
    }
}
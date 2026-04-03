import React from 'react';
import Events from "../utils/Events";
import Route from "../utils/Route";

export default class Link extends React.Component{

    constructor(props){
       super(props);
    }

    render(){
        return <a {...this.props} onClick={(e)=>{
            e.preventDefault();
            if(this.props.href && /[\S\s]+/.test(this.props.href)) {
                Route.pushState(this.props.href);
            }
        }}>
            {this.props.children}
        </a>
    }
}
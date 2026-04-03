import React from 'react';

export default class Body extends React.Component{

    render(){
        return <div className="ui-container ui-size-fluid background">
            {this.props.children}
        </div>
    }
}
import React,{Component} from 'react';

export default class Avatar extends Component{

    render() {
        let {square,text,image} = this.props;
        square = square ? square : "1em";
        return (
            <div className="ui-element avatar" style={{
                width: square,
                height: square,
                borderRadius: "100%",
                textAlign: "center",
                lineHeight: square,
                backgroundImage: !image ? "unset" : "url('"+image+"')"
            }}>
                {text ? text : null}
            </div>
        )
    }
}
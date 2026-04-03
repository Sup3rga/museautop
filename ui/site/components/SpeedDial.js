import React from "react";

export default class SpeedDial extends React.Component{

    render() {
        let {bottom = true, right = true, children, fixed = false} = this.props,
            style = {
                [bottom ? 'bottom' : 'top'] : '60px',
                [right ? 'right' : 'left']: '5px',
                height: 'auto'
            };
        return (
            <div {...this.props}
                 className={"ui-container float-wrapper "+(fixed ? 'ui-fixed' : 'ui-absolute')}
                 style={style}
            >
                {children}
            </div>
        )
    }
}
import React from 'react';
import Events from "../../utils/Events";

export default class StudioCreation extends React.Component{

    componentWillUnmount() {
        Events.emit("set-prev",false);
    }

    componentDidMount() {
        Events.emit("set-prev",true);
    }

    render() {
        return (
            <div>
                Salut le monde !
            </div>
        );
    }
}
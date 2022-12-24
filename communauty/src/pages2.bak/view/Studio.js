import React from "react";
import Field from "../../components/Field";
import SpeedDial from "../../components/SpeedDial";
import {Icon} from "../../components/Header";
import Route from "../../utils/Route";
import Link from "../../components/Link";

export default class Studio extends React.Component{

    render() {
        return (
            <div className="ui-container ui-size-fluid ui-fluid-height studio-grid">
                <div className="ui-container ui-size-fluid ui-unwrap grid-filter ui-vertical-center ui-height-2">
                    <div className="ui-element field-group">
                        <label className="ui-element ui-size-fluid">Catégorie</label>
                        <Field type="select" className="field" options={{
                            all: "Tout"
                        }}/>
                    </div>
                    <div className="ui-element field-group">
                        <label className="ui-element ui-size-fluid">Année</label>
                        <Field type="select" className="field" options={{
                            all: "Tout"
                        }}/>
                    </div>
                    <div className="ui-element field-group">
                        <label className="ui-element ui-size-fluid">Filiale</label>
                        <Field type="select" className="field" options={{
                            all: "Tout"
                        }}/>
                    </div>
                </div>
                <div className="ui-container ui-size-fluid ui-height-10 grid">

                </div>
                <SpeedDial>
                    <Link href="./studio/new">
                        <button>
                            <Icon icon="plus"/>
                        </button>
                    </Link>
                </SpeedDial>
            </div>
        )
    }
}
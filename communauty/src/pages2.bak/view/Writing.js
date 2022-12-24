import React,{Component} from "react";
import Ckeditor from '@ckeditor/ckeditor5-react';
import Field from "../../components/Field";
import SpeedDial from "../../components/SpeedDial";
import Link from "../../components/Link";
import {Icon} from "../../components/Header";

export default class Writing extends Component{

    render() {
        return (
            <div className="ui-container ui-size-fluid ui-fluid-height presentation">
                <div className="ui-container ui-size-fluid ui-unwrap grid-filter ui-vertical-center ui-height-2">
                    <div className="ui-element field-group">
                        <label className="ui-element">Catégorie</label>
                        <Field type="select" className="field ui-element" options={{
                            all: "Tout"
                        }}/>
                    </div>
                    <div className="ui-element field-group">
                        <label className="ui-element">Année</label>
                        <Field type="select" className="field ui-element" options={{
                            all: "Tout"
                        }}/>
                    </div>
                    <div className="ui-element field-group">
                        <label className="ui-element">Filiale</label>
                        <Field type="select" className="field ui-element" options={{
                            all: "Tout"
                        }}/>
                    </div>
                </div>
                <div className="ui-container ui-size-fluid ui-height-10 grid">

                </div>
                <SpeedDial>
                    <Link href="./writing/new">
                        <button>
                            <Icon icon="plus"/>
                        </button>
                    </Link>
                </SpeedDial>
            </div>
        );
    }
}
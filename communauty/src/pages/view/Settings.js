import AlertableComponent from "./AlertableComponent";
import Field from "../../components/Field";

export default class Settings extends AlertableComponent{

    constructor(props) {
        super(props);
        this.state = {
            filter: ''
        }
    }

    globalsSettings(){
        return (
            <div className="ui-container ui-size-fluid group ui-horizontal-left">
                <label className="ui-size-fluid">
                    Globals
                </label>
            </div>
        )
    }

    punchlineSettings(){
        return (
            <div className="ui-container ui-size-fluid group ui-horizontal-left">
                <label className="ui-size-fluid">
                    Les punchlines
                </label>
            </div>
        )
    }

    branchSettings(){
        return (
            <div className="ui-container ui-size-fluid group ui-horizontal-left">
                <label className="ui-size-fluid">
                    Les filiales
                </label>
            </div>
        )
    }

    render() {
        return (
            <div className="ui-container ui-size-fluid settings ui-horizontal-center">
                <div className="ui-element ui-size-fluid ui-sm-size-10 ui-md-size-8 ui-horizontal-left">
                    <h1>Gestion du site web </h1>
                    <Field
                        placeholder="rechercher une configuration"
                        className="ui-size-8 ui-sm-size-7 ui-md-size-6"
                        value={this.state.filter}
                        onChange={(e)=>this.changeValue('filter', e.target.value)}
                    />
                    {this.globalsSettings()}
                    {this.punchlineSettings()}
                    {this.branchSettings()}
                </div>
            </div>
        )
    }
}
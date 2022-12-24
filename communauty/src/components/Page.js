import React from "react";
import Drawer from "./Menu";
import SearchPanel from "./SearchPanel";
import Header from "./Header";
import Ressources from "../utils/Ressources";
import Events from "../utils/Events";

export default class Page extends React.Component{
    constructor(props) {
        super(props);
        let {title} = this.props;
        title = title || '';
        document.title = title;
    }

    componentDidMount() {
        window.addEventListener('scroll', (e)=>{
            Events.emit("scroll", {
                top: window.scrollY,
                left: window.scrollX
            });
        });
    }

    render(){
        console.log('[Menu]',this.props.menu);
        return (
            <>
                {this.props.menu}
                {this.props.search}
                <main className={"ui-container ui-size-fluid " + (this.props.className ? this.props.className : '')}
                      onClick={()=>{
                        Events.emit("close-search");
                      }}
                >
                    {this.props.header}
                    {this.props.children}
                    {this.props.footer}
                </main>
            </>
        );
    }
}

export class DefaultPage extends React.Component{
    render() {
        return (
            <Page
                className={this.props.className}
                title={this.props.title || Ressources.getProjectName()}
                header={<Header title={Ressources.getProjectName()}
                                links={Ressources.links}/>}
                menu={<Drawer/>}
                search={<SearchPanel className="ui-md-size-6 ui-lg-size-4"/>}
            >
                {this.props.children}
            </Page>
        );
    }
}
import React from 'react';
import BlankLoader, {EmptyView} from "../widget/BlankLoader";
import {Icon} from "../../components/Header";
import Management from "../../utils/Management";
import {Button} from "@mui/material";
import Route from "../../utils/Route";
import AlertableComponent from "./AlertableComponent";
import Events from "../../utils/Events";

class Draft extends React.Component{
    render() {
        const {
            title, category = null, lastModified=null, onDelete=null, id,
        } = this.props;
        return (
            <div className="ui-container ui-size-fluid draft-item" >
                <div className="ui-container ui-size-fluid title">
                    {title}
                </div>
                {
                    !category ? null:
                    <div className="ui-container ui-size-fluid category">
                        {Management.getCategoryName('writing', category)}
                    </div>
                }
                {
                    !lastModified ? null:
                        <div className="ui-container ui-size-fluid date">
                            Dernière modification : {lastModified}
                        </div>
                }
                <div className="ui-container ui-size-fluid actions">
                    <Button
                        variant="text"
                        color="error"
                        size="small"
                        startIcon={<Icon icon="trash"/>}
                        onClick={()=>{
                            if(onDelete){
                                onDelete(id);
                            }
                        }}
                    >
                        Supprimer
                    </Button>
                    <Button
                        variant="text"
                        size="small"
                        startIcon={<Icon icon="pen"/>}
                        onClick={()=>{
                            Route.pushState("/writing/new/dft-"+id)
                        }}
                    >
                        Continuer
                    </Button>
                </div>
            </div>
        );
    }
}

export default class ArticlesDraft extends AlertableComponent{

    constructor(props) {
        super(props);
        this.state = {
            ...super.getState(),
            list: [],
            loading: true
        };
    }

    reload(){
        const list = Management.getDraft();
        this.setState({
            list,
            loading: false
        });
    }

    componentDidMount() {
        super.componentDidMount();
        if(!Management.isGranted(300)){
            return this.banForPrivilege();
        }
        this.reload();
    }

    render() {
        if(this.block = this.blockRender()) return this.block;
        return (
            <div className="ui-element ui-size-fluid ui-fluid-height ui-scroll-y article-list">
                {
                    !this.state.list.length ?
                        (
                            <EmptyView
                                text="Aucun brouillon n'a été entamé !"
                                icon={<Icon icon="clipboard"/>}
                            />
                        )
                    :
                    this.state.list.map((data, index)=>{
                        return <Draft
                            {...data}
                            id={index}
                            key={index}
                            onDelete={(id)=>{
                                console.log('[Delete]',id);
                                this.toggleDialog({
                                    manual: true,
                                    content: 'Cet article sera supprimé',
                                    actions: [
                                        <Button
                                            onClick={()=>{
                                                this.toggleDialog({open: false})
                                            }}
                                        >Annuler</Button>,
                                        <Button
                                            color="error"
                                            variant="contained"
                                            onClick={()=>{
                                               this.toggleDialog({open: false})
                                               Management.removeDraft(id);
                                               this.fetch();
                                            }}
                                        >Oui</Button>
                                    ]
                                })
                                // Management.removeDraft(id);
                                // this.fetch();
                            }}
                        />
                    })
                }
                {this.renderDialog()}
            </div>
        );
    }
}
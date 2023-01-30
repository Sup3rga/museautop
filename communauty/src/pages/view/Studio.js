import React from "react";
import {Icon} from "../../components/Header";
import Route from "../../utils/Route";
import Link from "../../components/Link";
import Writing from "./Writing";
import {SpeedDial, SpeedDialAction, SpeedDialIcon} from "@mui/material";
import Management from "../../utils/Management";
import Filter from "../../utils/Filter";
import AlertableComponent from "./AlertableComponent";
import {EmptyView} from "../widget/BlankLoader";

class Punchline extends AlertableComponent{
    render() {
        return (
            <Link href={'/studio/new/'+this.props.id}
                className={'punchline ' +this.props.className}
            >
                <img className="ui-container"
                    src={this.props.caption}
                />
            </Link>
        )
    }
}

export default class Studio extends AlertableComponent{

    constructor(props) {
        super(props);

        this.state = {
            ...super.getState(),
            category: 0,
            artist: 0,
            year: 0,
            categories: {},
            artists: {},
            years: {},
            punchlines: {},
            loading: true
        }
    }

    reload() {
        Management.getPunchlinesCategory().then(async (data)=>{
            const categories = {
                0: 'Toutes les catégories',
                ...Filter.toOptions(data, 'id', 'name')
            };
            const _data = await Management.getPunchlinesData();
            console.log('[Data]',_data);
            this.setState({
                categories,
                artists: {
                    0: 'Tous les artistes',
                    ...Filter.toOptions(_data.artists)
                },
                years: {
                    0: 'Toutes les années',
                    ...Filter.toOptions(_data.years)
                },
                punchlines: _data.data,
                loading: false
            });
        }).catch((message)=>{
            this.setReloadable(message);
        });
    }

    componentDidMount() {
        super.componentDidMount();
        this.reload();
    }

    render() {
        if(this.block = this.blockRender()) return this.block;
        const empty = (text="Aucune carte de punchline n'a été créée.")=>{
            console.log('Empty',text);
            return <EmptyView
                icon={<Icon icon="id-card-alt"/>}
                text={text}
            />
        };
        let nbr = 0;
        return (
            <div className="ui-container ui-size-fluid ui-fluid-height presentation studio-grid">
                <div className="ui-container ui-size-fluid ui-unwrap grid-filter ui-vertical-center ui-height-2">
                    <div className="ui-element field-group ui-size-3">
                        <Writing.RenderSelect
                            className="ui-element ui-size-fluid field"
                            label = "Catégorie"
                            value = {this.state.category}
                            onChange={(e)=>this.changeValue('category', e.target.value)}
                            size="small"
                            list = {this.state.categories}
                        />
                    </div>
                    <div className="ui-element field-group ui-size-3">
                        <Writing.RenderSelect
                            className="ui-element ui-size-fluid field"
                            label = "Artiste"
                            size="small"
                            value = {this.state.artist}
                            onChange={(e)=>this.changeValue('artist', e.target.value)}
                            list = {this.state.artists}
                        />
                    </div>
                    <div className="ui-element field-group ui-size-3">
                        <Writing.RenderSelect
                            className="ui-element ui-size-fluid field"
                            label = "Année"
                            size="small"
                            value = {this.state.year}
                            onChange={(e)=>this.changeValue('year', e.target.value)}
                            list = {this.state.years}
                        />
                    </div>
                </div>
                <div className="ui-container ui-size-fluid ui-height-10 studio-grid">
                    {
                        !this.state.punchlines.length ? empty() :
                        this.state.punchlines.map((data)=>{
                            if(
                                (this.state.category > 0 && this.state.category != data.category.id) ||
                                (this.state.year != 0 && this.state.year != data.year) ||
                                (this.state.artist != 0 && this.state.artist.toLowerCase() !== data.artist.toLowerCase())
                            ){
                                return null;
                            }
                            nbr++;
                            return <Punchline
                                id={data.id}
                                key={data.id}
                                caption={data.card.path}
                                className="ui-container"
                            />
                        })
                    }
                    {
                        !nbr && this.state.punchlines.length ? empty("Aucune carte punchline trouvée !") : null
                    }
                </div>
                <SpeedDial sx={{ position: 'absolute', bottom: 70, right: 16 }}
                           icon={<SpeedDialIcon/>}
                           ariaLabel={"ok"}>
                    <SpeedDialAction
                        name="new"
                        icon={<Icon icon="pen"/>}
                        title={"bien"}
                        onClick={()=>Route.pushState('./studio/new')}
                    />
                    <SpeedDialAction
                        title="Catégorie"
                        name="category"
                        icon={<Icon icon="layer-group"/>}
                        onClick={()=>Route.pushState('./studio/category')}
                    />
                </SpeedDial>
            </div>
        )
    }
}
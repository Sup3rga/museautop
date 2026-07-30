"use client";
import React,{Component} from "react";
import {Icon} from "../../components/Header";
import {
    Autocomplete,
    Button,
    FormControl, InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon, TextField
} from "@mui/material";
import Route from "../../utils/Route";
import BlankLoader, {EmptyView} from "../widget/BlankLoader";
import Main from "../Main";
import Management from "../../utils/Management";
import {ArticlePreview} from "../../components/ArticleThumbnail";
import Filter from "../../utils/Filter";
import AlertableComponent from "./AlertableComponent";
import Events from "../../utils/Events";
import Link from "next/link";

export default class Writing extends AlertableComponent{

    constructor(props) {
        super(props);
        this.state = {
            ...super.getState(),
            currentCategory: 0,
            categories: {},
            articles: [],
            draft: 0
        }
    }

    reload() {
        Management.getWritingDatas().then(data => {
            let r = {
                0: 'Toutes les catégories'
            };
            let {categories = {}, articles = []} = data;
            for(let i in categories){
                r[categories[i].id] = categories[i].name;
            }
            this.changeState({
                loading: false,
                categories: r,
                articles: articles
            });
        }).catch(this.setReloadable.bind(this));
        this.changeState({
            draft: Management.getDraft().length
        })
    }

    componentDidMount() {
        super.componentDidMount();
        if(!Management.isGranted(1)){
            return this.banForPrivilege();
        }
        this.reload();
        Events.on("article-data-update", ()=>{
            this.changeState({
                articles: Management.data.articles[Main.branch]
            });
        }, this);
    }

    static RenderSelect(props){
        let {list} = props;
        return (
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{props.label}</InputLabel>
                <Select {...props}>
                    {
                        Object.keys(list).map((key,index)=>{
                            return <MenuItem value={key} key={index}>{list[key]}</MenuItem>
                        })
                    }
                </Select>
            </FormControl>
        )
    }

    static TextField(props){
        const startIcon = !props.startIcon ? null :  (
                <InputAdornment>
                    {props.startIcon}
                </InputAdornment>
            ),
            endIcon = !props.endIcon ? null :  (
                <InputAdornment>
                    {props.endIcon}
                </InputAdornment>
            );
        return (
            <TextField
                {...props}
                InputProps={{
                    startAdornment: startIcon,
                    endAdornment: endIcon
                }}
            />
        );
    }

    static AutoCompletion(props){
        const {options = []} = props;
        return (
            <Autocomplete
                freeSolo
                id="free-solo-2-demo"
                disableClearable
                value={props.value ? props.value : null}
                className={props.className}
                options={options}
                renderInput={(params) => {
                    return (
                            <Writing.TextField
                                {...params}
                                label={props.label}
                                placeholder={props.placeholder ? props.placeholder.toString() : null}
                                onChange={props.onChange ? props.onChange : null}
                                onBlur={props.onBlur ? props.onBlur : null}
                                type={props.type ? props.type : 'text'}
                                startIcon={props.startIcon}
                                endIcon={props.endIcon}
                            />
                        )
                }}
            />
        )
    }

    render() {
        if(this.block = this.blockRender()) return this.block;
        let nbr = 0,
            empty = (<EmptyView
                text="Liste des articles vide !"
                icon={<Icon icon="newspaper"/>}
            />);
        return (
            <div className="flex flex-col ui-size-fluid ui-fluid-height presentation">
                <div className="ui-container ui-size-fluid ui-unwrap grid-filter ui-vertical-center p-4!">
                    <div className="ui-element field-group ui-size-7 ui-sm-size-4 ui-md-size-3">
                        <Writing.RenderSelect
                            className="ui-element ui-size-fluid field"
                            label = "Catégorie"
                            value = {this.state.currentCategory}
                            sx={{height: 40}}
                            list = {this.state.categories}
                            onChange={(e)=>{
                                this.setState(state=>{ return {...state, currentCategory: e.target.value} });
                            }}
                        />
                    </div>
                    {
                        !this.state.draft ? null:
                        <Link href={"./writing/draft"}>
                            <Button color="warning">
                                Brouillons ({this.state.draft})
                            </Button>
                        </Link>
                    }
                </div>
                <div className="block flex-[1] overflow-y-auto article-list">
                    <div className={"w-full flex flex-col"}>
                        {
                            !this.state.articles.length ?
                                empty
                                :
                                this.state.articles.map((data, index)=>{
                                    let props = Filter.object(data, [
                                        'title','caption','category', 'stats', 'createdBy', 'modifiedBy', 'id', 'slug'
                                    ]);
                                    if(this.state.currentCategory == 0 || props.category.id == this.state.currentCategory) {
                                        if (props.modifiedBy.id === props.createdBy.id) {
                                            props.modifiedBy = null;
                                        }
                                        nbr++;
                                        return <ArticlePreview
                                            key={index}
                                            adminMod={true}
                                            skeleton={!('id' in data)}
                                            {...props}
                                        />
                                    }
                                })
                        }
                        {
                            nbr ? null: empty
                        }
                    </div>
                </div>
                <SpeedDial sx={{ position: 'absolute', bottom: 70, right: 16 }}
                    icon={<SpeedDialIcon/>}
                    ariaLabel={"ok"}>
                    <SpeedDialAction
                        name="new"
                        sx={{width: 50, height: 50}}
                        icon={<Icon icon="feather" className={"text-3xl"}/>}
                        title={"Nouvel article"}
                        onClick={()=>location.href = './writing/new'}
                    />
                    {
                        !Management.isGranted(4) ? null:
                        <SpeedDialAction
                            title="Catégorie"
                            name="category"
                            sx={{width: 50, height: 50}}
                            icon={<Icon icon="layer-group" className={"text-3xl"}/>}
                            onClick={()=>location.href = './writing/category'}
                        />
                    }
                </SpeedDial>
            </div>
        );
    }
}
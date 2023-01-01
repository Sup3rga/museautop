import React from 'react';
import {Button, Chip, CircularProgress, Grid, IconButton, Stack, TextField, Typography} from "@mui/material";
import {Icon} from "../../components/Header";
import Main from "../Main";
import AlertableComponent from "./AlertableComponent";
import Management from "../../utils/Management";
import Url from "../../utils/Url";
import Events from "../../utils/Events";


export default class Category extends AlertableComponent{

    constructor(props) {
        super(props);
        this.name = '';
        this.sector = /^\/writing/.test(Url.get()) ? 'writing' : 'punchlines';
        Management.setCategoriesStorage();
        this.categories = Management.data.categories[this.sector];
        this.submitable = {
            save: [],
            delete: []
        };
        this.state = {
            ...super.getState(),
            name: '',
            editMode: false,
            deletableCount: 0,
            modified: false,
            list: []
        }
    }

    componentDidMount() {
        Management.getArticlesCategory().then((data)=>{
            this.setState(state => {
                return {
                    ...state,
                    list: data
                }
            })
        }).catch(message => {
            this.toggleSnack({
                content: message
            })
        })
        setTimeout(()=>Events.emit("set-prev",true), 100);
    }

    componentWillUnmount() {
        setTimeout(()=>Events.emit("set-prev",false), 100);
    }

    exists(name){
        let categories = this.state.list,
            result = false;
        name = name.toLowerCase();
        for(let i in categories){
            if(categories[i].name.toLowerCase() === name){
                result = true;
                break;
            }
        }
        if(result){
            for(let i in this.submitable.save){
                if(this.submitable.save[i].name.toLowerCase() === name){
                    result = true;
                    break;
                }
            }
        }
        return result;
    }

    deleteByName(list, name){
        let result = [];
        name = name.toLowerCase();
        for(let i in list){
            if(list[i].name.toLowerCase() !== name){
                result.push(list[i]);
            }
        }
        return result;
    }

    addCategory(name){
        if(this.exists(name)){
            this.toggleDialog({
              content: 'Cette catégorie existe déjà !'
            });
            return;
        }
        this.deleteByName(this.submitable.save, name);
        const item = {name: name};
        this.submitable.save.push(item);
        this.setState(state => {
            return {
                ...state,
                list: [ ...state.list, {name: name}],
                deletableCount: this.submitable.delete.length,
            }
        });
    }

    removeCategory(data, restore = false){
        let list = this.deleteByName(this.state.list, data.name);
        if(!restore) {
            if('id' in data) {
                this.submitable.delete.push(data);
            }
            console.log('[List]',list,data);
        }
        else{
            this.submitable.delete = this.deleteByName(this.submitable.delete, data.name);
            if('id' in data) {
                list.push(data);
            }
        }
        this.setState(state=> {
            return {
                ...state,
                list,
                deletableCount: this.submitable.delete.length
            }
        });
    }

    submit(){
        let query = {
            save: [],
            del: [],
            ...Management.defaultQuery()
        }, item;
        if(this.state.editMode){
            query.save.push({
                ...this.state.editMode,
                name: this.state.name
            });
        }
        else {
            for (let i in this.submitable.save) {
                item = {name: this.submitable.save[i].name};
                if ('id' in this.submitable.save[i]) {
                    item.id = this.submitable.save[i].id;
                }
                query.save.push(item);
            }
            for (let i in this.submitable.delete) {
                query.del.push(this.submitable.delete[i].id);
            }
        }
        // console.log('[Sector]',this.sector,query);
        this.showLoading();
        Main.socket
        .emit('/'+this.sector+'/category/set', query)
        .once('/'+this.sector+'/category/get', async (e)=>{
            console.log('[E]',e);
            this.toggleDialog({
                content: e.error ? e.message : Management.readCode(e.code),
                manual: true
            })
            Management.data.categories[this.sector] = e.data;
            await Management.commit();
            this.submitable.save = [];
            this.submitable.delete = [];
            this.setState(state => {
                return {
                    ...state,
                    editMode: false,
                    name: '',
                    list: e.data
                }
            })
        });
    }

    render() {
        return (
            <div className="ui-container ui-size-fluid ui-fluid-height ui-column category-editor">
                <div className="ui-container ui-size-fluid ui-vertical-center">
                    <Grid container alignItems="center" spacing={2} sx={{width: '100%'}}>
                        <Grid item>
                            <TextField
                                label="Catégorie"
                                size="small"
                                value={this.state.name}
                                onChange={(e)=> {
                                    this.setState(state => {
                                        return {...state, name: e.target.value}
                                    });
                                }}
                            />
                        </Grid>
                        <Grid item>
                            {
                                this.state.editMode ?
                                    <Button
                                        endIcon={<Icon icon="times"/>}
                                        variant="outlined"
                                        color="error"
                                        onClick={()=>{
                                            this.setState(state => {
                                                return {
                                                    ...state,
                                                    editMode: false,
                                                    name: ''
                                                }
                                            })
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                    :
                                    <Button
                                        endIcon={<Icon icon="plus"/>}
                                        variant="contained"
                                        onClick={()=>{
                                            this.addCategory(this.state.name);
                                            this.setState(state => {
                                                return {...state, name: ''}
                                            })
                                        }}
                                    >
                                        Ajouter
                                    </Button>
                            }
                        </Grid>
                        <Grid item>
                            <Button
                                endIcon={<Icon icon="save"/>}
                                variant="contained"
                                disabled={this.submitable.save.length || this.state.deletableCount || this.state.editMode ? false : true}
                                onClick={()=>this.submit()}
                            >
                                Enregistrer les changements
                            </Button>
                        </Grid>
                    </Grid>
                </div>
                {
                    !this.state.deletableCount ? null :
                    (
                        <>
                            <div className="ui-container ui-size-fluid head">À supprimer</div>
                            <div className="ui-container ui-size-fluid ui-scroll-y category-list">
                                <Grid container spacing={2}  sx={{width: '100%'}} >
                                    {
                                        this.submitable.delete.map((data,index)=>{
                                            return(
                                                <Grid item>
                                                    <Chip
                                                        color="warning"
                                                        key={index}
                                                        label={data.name}
                                                        onDelete={()=>this.removeCategory(data, true)}
                                                    />
                                                </Grid>
                                            )
                                        })
                                    }
                                </Grid>
                            </div>
                        </>
                    )
                }
                <div className="ui-container ui-size-fluid head">Toutes les catégories</div>
                <div className="ui-container ui-size-fluid ui-scroll-y category-list">
                    <Grid container spacing={2}  sx={{width: '100%'}} >
                        {
                            this.state.list.map((data,index)=>{
                                return(
                                    <Grid item>
                                        <Chip
                                            variant={'id' in data ? 'filled' : 'outlined'}
                                            color={'id' in data ? 'default' : 'success'}
                                            key={index}
                                            label={data.name}
                                            onDelete={()=>this.removeCategory(data)}
                                            onClick={()=>{
                                                this.setState(state => {
                                                    return {
                                                        ...state,
                                                        name: data.name,
                                                        editMode: data
                                                    }
                                                })
                                            }}
                                        />
                                    </Grid>
                                )
                            })
                        }
                    </Grid>
                </div>
                {super.renderDialog()}
            </div>
        )
    }
}
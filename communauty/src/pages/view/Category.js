import React from 'react';
import {Button, Chip, Grid, IconButton, Stack, TextField, Typography} from "@mui/material";
import {Icon} from "../../components/Header";
import Main from "../Main";
import AlertableComponent from "./AlertableComponent";
import Management from "../../utils/Management";
import Url from "../../utils/Url";


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
            deletableCount: 0,
            modified: false,
            list: []
        }
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
        for(let i in this.submitable.save){
            item = {name: this.submitable.save[i].name};
            if('id' in this.submitable.save[i]){
                item.id = this.submitable.save[i].id;
            }
            query.save.push(item);
        }
        for(let i in this.submitable.delete){
            query.del.push(this.submitable.delete[i].id);
        }
        console.log('[Sector]',this.sector,query);
        Main.socket
            .emit('/'+this.sector+'/category/set', query)
            .on('/'+this.sector+'/category/get', (e)=>{
                console.log('[E]',e);
                Management.data.categories[this.sector] = e;
            })
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
                        </Grid>
                        <Grid item>
                            <Button
                                endIcon={<Icon icon="save"/>}
                                variant="contained"
                                disabled={this.submitable.save.length || this.state.deletableCount ? false : true}
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
                                                        onClick={()=>{
                                                            console.log('[Edit]',data);
                                                        }}
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
                                            key={index}
                                            label={data.name}
                                            onDelete={()=>this.removeCategory(data)}
                                            onClick={()=>{
                                                console.log('[Edit]',data);
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
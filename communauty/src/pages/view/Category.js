import React from 'react';
import {Button, Chip, Grid, IconButton, Stack, TextField, Typography} from "@mui/material";
import {Icon} from "../../components/Header";
import Main from "../Main";
import AlertableComponent from "./AlertableComponent";


export default class Category extends AlertableComponent{

    constructor(props) {
        super(props);
        this.name = '';
        this.state = {
            ...super.getState(),
            modified: false,
            list: []
        }
    }

    exists(name){
        let categories = this.state.list;
        for(let i in categories){
            if(categories[i].name.toLowerCase() === name.toLowerCase()){
                return true;
            }
        }
        return false;
    }

    addCategory(name){
        if(this.exists(name)){
            this.toggleDialog({
              content: 'Cette catégorie existe déjà !'
            });
            return;
        }
        this.setState(state => {
            return {
                ...state,
                list: [ ...state.list, {name: name}]
            }
        })
    }

    removeCategory(data){
        let list = [],
            categories = this.state.list;
        for(let i in categories){
            if(categories[i].name.toLowerCase() !== data.name){
                list.push(categories[i]);
            }
        }
        this.setState(state=> {
            return {
                ...state,
                list
            }
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
                                onChange={(e)=> this.name = e.target }
                            />
                        </Grid>
                        <Grid item>
                            <Button
                                endIcon={<Icon icon="plus"/>}
                                variant="contained"
                                onClick={()=>{
                                    this.addCategory(this.name.value);
                                    this.name.value = '';
                                }}
                            >
                                Ajouter
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button endIcon={<Icon icon="save"/>} variant="contained" disabled={true}>
                                Enregistrer les changements
                            </Button>
                        </Grid>
                    </Grid>
                </div>
                <div className="ui-container ui-size-fluid head">Toutes les catégories</div>
                <div className="ui-container ui-size-fluid ui-scroll-y category-list">
                    <Grid container spacing={2}  sx={{width: '100%'}} >
                        {
                            this.state.list.map((data,index)=>{
                                return(
                                    <Grid item>
                                        <Chip
                                            label={data.name}
                                            onDelete={()=>this.removeCategory(data)}
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
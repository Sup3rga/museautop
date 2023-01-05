import React from 'react';
import Events from "../../utils/Events";
import {Autocomplete, Button, InputAdornment, TextField} from "@mui/material";
import {Icon} from "../../components/Header";
import Writing from "./Writing";
import AkaDatetime from "../../utils/AkaDatetime";

export default class StudioCreation extends React.Component{

    constructor(props) {
        super(props);
        this.canvas = {
            element: React.createRef(),
            context: null
        }
        this.inputFile = React.createRef();
        this.state = {
            title: '',
            year: 0,
            artist: '',
            lyrics: '',
            punchline: '',
            category: null,
            comment: '',
            image: null,
            logo: null,
            width: 400,
            height: 400,
            years: [],
            artists: [],
            categories: [],
            submit: false,
            ready: false
        };
    }

    draw(){

    }

    loadImage(){
        this.inputFile.current.click();
        this.inputFile.current.addEventListener('change',(e)=>{
            this.changeValue('image', this.inputFile.current.files[0]);
        })
    }

    changeState(value){
        this.setState(state=>{
            return {
                ...state,
                ...value
            }
        });
    }

    changeValue(index,value){
        this.setState(state=>{
            return {
                ...state,
               [index] : value
            }
        });
    }

    componentDidMount() {
        Events.emit("set-prev",true);
        setTimeout(()=>{Events.emit("set-prev",true);},300);

    }


    componentWillUnmount() {
        Events.emit("set-prev",false);
    }

    submit(){
        console.log('[submit]');
    }

    render() {
        const adornment = {
            endAdornment: <InputAdornment position="start">pixels</InputAdornment>,
        };
        return (
            <div className="ui-container ui-fluid studio ui-column ui-unwrap">
                <div className="ui-container ui-size-fluid ui-vertical-center header">
                    <label className="ui-element ui-size-6">
                        Punchline Studio
                    </label>
                    <div className="actions ui-element ui-size-6 ui-horizontal-right">
                        <Button
                            variant="contained"
                            startIcon={<Icon icon="save"/>}
                            disabled={!this.state.submit || !this.state.ready}
                            onClick={()=>this.submit()}
                        >
                            Enregistrer
                        </Button>
                    </div>
                </div>
                <div className="ui-container ui-fluid ui-column ui-row-reverse ui-scroll-y">
                    <div className="ui-container ui-size-fluid ui-md-size-6 render ui-all-center">
                        <canvas
                            className="ui-container"
                            ref={this.canvas.element}
                            width={this.state.width}
                            height={this.state.height}
                        />
                        <input className="ui-element ui-hide" type="file" ref={this.inputFile}/>
                        <div className="ui-container ui-size-fluid ui-unwrap">
                            <Button
                                className="ui-size-4"
                                variant="contained"
                                startIcon={<Icon icon="image"/>}
                                onClick={()=>{this.loadImage()}}
                            >
                                L'image de fond
                            </Button>
                            <div className="ui-container wrapper ui-size-4">
                                <TextField
                                    className="ui-size-fluid"
                                    size="small"
                                    label="Largeur"
                                    type="number"
                                    InputProps={adornment}
                                    value={this.state.width}
                                    onChange={(e)=>{this.changeValue('width', e.target.value)}}
                                />
                            </div>
                            <div className="ui-container wrapper ui-size-4">
                                <TextField
                                    className="ui-size-fluid"
                                    size="small"
                                    label="Hauteur"
                                    type="number"
                                    InputProps={adornment}
                                    value={this.state.height}
                                    onChange={(e)=>{this.changeValue('height', e.target.value)}}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="ui-container ui-size-fluid ui-md-size-6 data">
                        <div className="ui-element ui-size-6 wrapper">
                            <TextField
                                className="ui-size-fluid"
                                label="Titre"
                                helperText="Le titre de la musique"
                                value={this.state.title}
                                onChange={(e)=>this.changeValue('title', e.target.value)}
                            />
                        </div>
                        <div className="ui-element ui-size-6 wrapper">
                            <Writing.AutoCompletion
                                label="Année de sortie"
                                placeholder={new AkaDatetime().getYear()}
                                value={this.state.year}
                                onChange={(e)=> this.changeValue('year', e.target.value)}
                                className="ui-size-fluid"
                                options={this.state.years}
                                startIcon={<Icon icon="calendar"/>}
                            />
                        </div>
                        <div className="ui-element ui-size-6 wrapper">
                            <Writing.AutoCompletion
                                label="Artiste"
                                placeholder="Nom de l'artiste"
                                className="ui-size-fluid"
                                options={this.state.years}
                                startIcon={<Icon icon="user-astronaut"/>}
                                value={this.state.artist}
                                onChange={(e)=>this.changeValue('artist', e.target.value)}
                            />
                        </div>
                        <div className="ui-element ui-size-6 wrapper">
                            <Writing.RenderSelect
                                label="Catégorie"
                                placeholder="La catégorie"
                                list={this.state.categories}
                                value={this.state.category}
                                onChange={(e)=>this.changeValue('category', e.target.value)}
                            />
                        </div>
                        <div className="ui-element ui-size-fluid wrapper">
                            <TextField
                                multiline={true}
                                className="ui-size-fluid"
                                label="Punchline"
                                rows={2}
                                value={this.state.punchline}
                                onChange={(e)=>this.changeValue('punchline', e.target.value)}
                            />
                        </div>
                        <div className="ui-element ui-size-fluid wrapper">
                            <TextField
                                multiline={true}
                                className="ui-size-fluid"
                                label="Paroles du morceau (facultatif)"
                                rows={5}
                                value={this.state.lyrics}
                                onChange={(e)=>this.changeValue('lyrics', e.target.value)}
                            />
                        </div>
                        <div className="ui-element ui-size-fluid wrapper">
                            <TextField
                                multiline={true}
                                className="ui-size-fluid"
                                label="Commentaire (facultatif)"
                                rows={4}
                                value={this.state.comment}
                                onChange={(e)=>this.changeValue('comment', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
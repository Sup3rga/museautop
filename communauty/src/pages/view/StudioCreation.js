import React from 'react';
import Events from "../../utils/Events";
import {Autocomplete, Button, InputAdornment, TextField} from "@mui/material";
import {Icon} from "../../components/Header";
import Writing from "./Writing";
import AkaDatetime from "../../utils/AkaDatetime";
import BlankLoader from "./BlankLoader";
import Management from "../../utils/Management";
import AlertableComponent from "./AlertableComponent";
import Main from "../Main";

export default class StudioCreation extends AlertableComponent{
    static logo = {};
    constructor(props) {
        super(props);
        this.canvas = {
            element: React.createRef(),
            context: null
        }
        this.cardConfig = {
            retroBackground: 'rgb(50,70,100)',
            textColor: 'rgb(255,255,255)',
            rectBackground: 'rgb(255,255,255)',
            rectColor: 'rgb(0,0,0)',
            mask: 'rgba(0,0,0,0.6)'
        };
        this.inputFile = React.createRef();
        this.timer = null;
        this.state = {
            ...super.getState(),
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

    setPunchlineText(context,mod = 20){
        let text = this.state.punchline,
            result = '';
        console.log('[Text]',text.length);
        for(let i in text){
            result += text[i]+(i % mod && i > 0 && i < text.length - 1 ? '' : '\n')
        }
        return result;
    }

    async draw(){
        if(!StudioCreation.logo[Main.branch]){
            return;
        }
        this.canvas.context = this.canvas.element.current.getContext('2d')
        const canvas = this.canvas.element.current,
              ctx = this.canvas.context,
              legendRatio = 0.23,
              legendPadding = 10,
              legendHeight = canvas.height * legendRatio,
              legendPosY = canvas.height * (1 - legendRatio),
              logoSquare = legendHeight - legendPadding * 2,
              logoPos = {
                  x : canvas.width - legendPadding - logoSquare,
                  y : legendPosY + legendPadding
              };
        console.log('[Draw]',this.canvas, this.state.image);
        //Draw rectangle
        ctx.fillStyle = this.cardConfig.retroBackground;
        ctx.fillRect(0,0,canvas.width, canvas.height);
        //Draw Image
        if(this.state.image) {
            const image = await this.getImage(this.state.image),
                  cadran = {
                      width: canvas.width,
                      height: legendPosY,
                      box: canvas.width * 0.8
                  },
                  img = {
                    width: image.width,
                    height: image.height,
                    ratio: image.width / image.height
                  },
                  size = {
                    width: img.width > cadran.box ? cadran.box : img.width,
                    y: 0, x: 0
                  };
            size.height = size.width * img.ratio
            size.y = cadran.height - size.height;
            size.x = (cadran.width - size.width) / 2;
            cadran.ratio = cadran.width / cadran.height;
            ctx.drawImage(image, size.x, size.y, size.width, size.height);
        }
        //Draw mask
        ctx.fillStyle = this.cardConfig.mask;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        //Draw Punchline
        const breakLength = 20;
        let text = this.state.punchline;
        text = !text.length ? '' : '« '+text+' »';
        ctx.font = '14pt Merriweather-Bold';
        let lineHeight = 0, lineSpacing = 8,
            line = '',
            k = 0,
            breakit = false,
            lines = [],
            geo,dim;
        ctx.fillStyle = this.cardConfig.textColor;
        for(let i = 0; i < text.length; i++){
            /*
                If the number of characters is up to the breakLength, we will
                watch to break after a word
            * */
            if(k >= breakLength){
                breakit = true;
            }
            //Only after a white charactere
            if( (/[\s]/.test(text[i]) && breakit) || (i == text.length - 1 && line.length)){
                if(i == text.length - 1){
                    line += text[i];
                }
                lines.push(line);
                // console.log('[Line]',line);
                line = '';
                k = 0;
                breakit = false;
            }
            line += text[i];
            k++;
        }
        //we draw each line
        for(let i in lines){
            dim = ctx.measureText(lines[i]);
            lineHeight += i == 0 ? 0 : dim.fontBoundingBoxAscent + lineSpacing;
            geo = {
                x: (canvas.width - dim.width + dim.actualBoundingBoxLeft + dim.actualBoundingBoxRight) / 2,
                y: (canvas.height - legendHeight + dim.fontBoundingBoxAscent) / 2 + lineHeight
            }
            ctx.fillText(lines[i], geo.x, geo.y);
        }
        //Draw legend rect
        ctx.fillStyle = this.cardConfig.rectBackground;
        ctx.fillRect(0, canvas.height * (1 - legendRatio), canvas.width, legendHeight);
        //Draw legend upline
        ctx.fillStyle = this.cardConfig.retroBackground;
        ctx.fillRect(0, legendPosY + legendPadding / 2, canvas.width, legendPadding / 4);
        const logo = await this.getImage(StudioCreation.logo[Main.branch]);
        ctx.drawImage(logo, logoPos.x, logoPos.y, logoSquare, logoSquare);
        //Artiste Name
        ctx.font = '22pt Rubik-Bold';
        ctx.textAlign = 'center';
        dim = ctx.measureText(this.state.artist.toUpperCase());
        const artist = {
            x: (canvas.width - dim.width + dim.actualBoundingBoxLeft + dim.actualBoundingBoxRight) / 2,
            y: legendPosY + (legendHeight + dim.fontBoundingBoxAscent) / 2
        };
        ctx.fillStyle = this.cardConfig.rectColor;
        ctx.fillText(this.state.artist.toUpperCase(), artist.x, artist.y);
    }

    async getImage(file){
        const image = new Image();
        return new Promise((res)=>{
            if(file instanceof Blob){
                let read = new FileReader();
                read.onload = ()=>{
                    image.src = read.result;
                    res(image);
                }
                read.readAsDataURL(file);
            }
        })
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
        if(['artist','punchline','image'].indexOf(index) >= 0){
            this.timer = setTimeout(()=>{
                clearTimeout(this.timer);
                this.draw();
            },200);
        }
    }

    componentDidMount() {
        Events.emit("set-prev",true);
        setTimeout(()=>{Events.emit("set-prev",true);},300);
        if(StudioCreation.logo[Main.branch]){
            return this.changeState({
                logo: StudioCreation.logo[Main.branch],
                ready: true
            })
        }
        Management.getLogo().then((data)=>{
            StudioCreation.logo[Main.branch] = data.data;
            this.draw();
            this.changeState({
                logo: StudioCreation.logo[Main.branch],
                ready: true
            });
        }).catch((message)=>{
            this.toggleDialog({
                content: message
            });
        });
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
                    <div className="ui-container ui-relative ui-size-fluid ui-md-size-6 render ui-all-center">
                        <canvas
                            className="ui-container"
                            ref={this.canvas.element}
                            width={this.state.width}
                            height={this.state.height}
                        />
                        {
                            this.state.ready ? null:
                            <div className="ui-container ui-fluid ui-absolute mask">
                                <BlankLoader/>
                            </div>
                        }
                        <input className="ui-element ui-hide" type="file" ref={this.inputFile}/>
                        <div className="ui-container ui-size-fluid ui-unwrap actions">
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
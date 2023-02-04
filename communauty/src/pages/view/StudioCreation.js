import React from 'react';
import Events from "../../utils/Events";
import {Button, InputAdornment, TextField} from "@mui/material";
import {Icon} from "../../components/Header";
import Writing from "./Writing";
import AkaDatetime from "../../utils/AkaDatetime";
import BlankLoader from "../widget/BlankLoader";
import Management from "../../utils/Management";
import AlertableComponent from "./AlertableComponent";
import Main from "../Main";
import Scheduler from "../widget/Scheduler";
import Filter from "../../utils/Filter";
import Url from "../../utils/Url";

export default class StudioCreation extends AlertableComponent{
    static logo = {};
    static count = 0;
    constructor(props) {
        super(props);
        this.canvas = {
            element: React.createRef(),
            context: null
        }
        this.cardConfig = {
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
            category: '',
            comment: '',
            image: null,
            imageFile: null,
            canEdit: true,
            logo: null,
            years: [],
            artists: [],
            categories: [],
            submit: false,
            ready: false,
            preview: '',
            showConfig: false,
            date: '',
            auto: true,
            time: '',
            edit: null,
            card: {
                width: 400,
                height: 400,
                artistSize: 22,
                textSize: 14
            }
        };
    }

    async draw(frame = null){
        if(!StudioCreation.logo[Main.branch] || !this.canvas.element.current){
            return;
        }
        this.canvas.context = this.canvas.element.current.getContext('2d');
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
        ctx.clearRect(0,0,canvas.width, canvas.height);
        // console.log('[Draw]',this.canvas, this.state.image);
        //Draw rectangle
        ctx.fillStyle = this.cardConfig.cardBg;
        ctx.fillRect(0,0,canvas.width, canvas.height);
        //Draw Image
        if(this.state.image) {
            const image = this.state.image,
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
            size.height = size.width / img.ratio;
            if(size.height > cadran.height){
                size.height = cadran.height;
                size.width = cadran.height * img.ratio;
            }
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
        ctx.font = this.state.card.textSize+'pt Merriweather-Bold';
        let lineHeight = 0, lineSpacing = 8,
            line = '',
            k = 0,
            breakit = false,
            lines = [],
            reduceHeight = 0,
            geo,dim;
        ctx.fillStyle = this.cardConfig.cardTextColor;
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
                dim = ctx.measureText(lines[i]);
                reduceHeight = i == 0 ? 0 : dim.fontBoundingBoxAscent + lineSpacing + dim.fontBoundingBoxDescent;
                lines.push(line);
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
                y: (canvas.height - legendHeight + dim.fontBoundingBoxAscent) / 2 + lineHeight - reduceHeight
            }
            ctx.fillText(lines[i], geo.x, geo.y);
        }
        //Draw legend rect
        ctx.fillStyle = this.cardConfig.cardBandBg;
        ctx.fillRect(0, canvas.height * (1 - legendRatio), canvas.width, legendHeight);
        //Draw legend upline
        ctx.fillStyle = this.cardConfig.cardBg;
        ctx.fillRect(0, legendPosY + legendPadding / 2, canvas.width, legendPadding / 4);
        //Artiste Name
        ctx.font = this.state.card.artistSize+'pt Rubik-Bold';
        ctx.textAlign = 'center';
        dim = ctx.measureText(this.state.artist.toUpperCase());
        const artist = {
            x: (canvas.width - dim.width + dim.actualBoundingBoxLeft + dim.actualBoundingBoxRight) / 2,
            y: legendPosY + (legendHeight + dim.fontBoundingBoxAscent) / 2
        };
        ctx.fillStyle = this.cardConfig.cardBandColor;
        ctx.fillText(this.state.artist.toUpperCase(), artist.x, artist.y);
        //Branch logo
        const logo = StudioCreation.logo[Main.branch];
        ctx.drawImage(logo, logoPos.x, logoPos.y, logoSquare, logoSquare);
        if(frame){
            frame(this.draw.bind(this));
        }
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
            else if(typeof file == 'string'){
                image.src = file;
                image.onload = ()=>{
                    res(image);
                }
            }
        })
    }

    loadImage(){
        this.inputFile.current.click();
        this.inputFile.current.addEventListener('change',async(e)=>{
            this.state.imageFile = this.inputFile.current.files[0];
            const image = await this.getImage(this.state.imageFile);
            this.changeValue('image', image);
        });
    }

    setCardConfig(index, value){
        this.setState(state=>{
            return {
                ...state,
                card: {
                    ...state.card,
                    [index]: value
                }
            }
        });
    }

    static frame(executor){
        const animate = window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame;
        animate(()=>{
            executor(StudioCreation.frame);
        });
    }

    async reload(){
        try{
            const data = await Management.getPunchlinesConfig();
            this.cardConfig = {...this.cardConfig, ...data};
            console.log('[config]',data);
        }catch (message){
            return this.setReloadable(message);
        }
        try{
            const data = await Management.getPunchlinesCategory();
            this.changeValue('categories', Filter.toOptions(data,'id','name'));
        }catch (message){
            return this.setReloadable(message);
        }
        if(/^\/studio\/new\/([0-9]+)$/.test(Url.get())){
            const id = RegExp.$1;
            this.changeValue('edit', await Management.getPunchlinesData(id));
            if(this.state.edit) {
                console.log('[Edit]',this.state.edit);
                this.state.canEdit = this.state.edit.createdBy.id == Management.data.id || Management.isGranted()
                const image = await this.getImage(this.state.edit.picture.path);
                this.setState(state => {
                    return {
                        ...state,
                        loading: false,
                        title: this.state.edit.title,
                        year: this.state.edit.year.toString(),
                        artist: this.state.edit.artist,
                        lyrics: this.state.edit.lyrics,
                        punchline: this.state.edit.punchline,
                        category: this.state.edit.category.id,
                        comment: this.state.edit.comment,
                        image
                    }
                });
            }
            else{
                this.setReloadable(
                    <>
                        <p>
                            Un erreur de ressource s'est produite !
                        </p>
                        <p style={{fontSize: '.6em', color: '#5a2e1c'}}>
                            <ul>
                                <li>
                                    Veuillez vérifier si vous vous trouver dans la bonne filiale.
                                </li>
                                <li>
                                    Veuillez vérifier si le lien de l'url est correct.
                                </li>
                            </ul>
                        </p>
                    </>
                )
            }
        }
        try {
            if(StudioCreation.logo[Main.branch]){
                this.changeState({
                    logo: StudioCreation.logo[Main.branch]
                })
            }
            else {
                //set Logo
                const data = await Management.getLogo(),
                      logo = await this.getImage(data.data);
                StudioCreation.logo[Main.branch] = logo;
                this.changeState({logo});
            }
        }catch(message){
            return this.setReloadable(message);
        }
        this.changeState({
            loading: false,
            ready: true
        });
        StudioCreation.frame(this.draw.bind(this));
    }

    componentDidMount() {
        super.componentDidMount();
        this.reload();
    }

    async submit(){
        // console.log('[submit]',this.state);
        try{
            let query = Filter.object(this.state, [
                'title','year','artist','category','punchline',
                'lyrics','comment'
            ]);
            query.schdate = this.state.auto || !this.state.date.length || !this.state.time.length ? null : this.state.date+' '+this.state.time;
            if(this.state.edit){
                query.id = this.state.edit.id;
            }
            query.image = null;
            if(this.state.imageFile){
                query.image = this.state.imageFile;
            }
            query.card = await (()=>{
                return new Promise((res)=>{
                    try {
                        this.canvas.element.current.toBlob((blob) => {
                            res(blob);
                        });
                    }
                    catch(e){
                        res(null);
                    }
                })
            })();
            this.toggleUploadInfo({
                text: 'Requête en cours'
            })
            const data = await Management.commitPunchline(query, (progress) => {
                this.toggleUploadInfo({
                    text: 'Requête en cours',
                    process: progress.currentProcess,
                    progress: progress.progress
                });
            });
            this.toggleDialog({
                content: Management.readCode(data.code)
            });
        }catch (message){
            this.toggleDialog({
                content: message
            });
        }
        this.toggleUploadInfo({open: false});
    }

    render() {
        if(this.block = this.blockRender()) return this.block;
        const adornment = (text = 'pixels')=>{
            return {
                endAdornment: <InputAdornment position="start">text</InputAdornment>,
            }
        };
        this.state.submit = Filter.contains(this.state, [
            'title','year','artist','punchline','image'
        ], [null,0,'']);
        const fontSizes = {};
        for(let i = 22; i >= 7; i--){
            fontSizes[i] = i;
        }
        return (
            <div className="ui-container ui-fluid studio ui-column ui-unwrap">
                <div className="ui-container ui-size-fluid ui-vertical-center header">
                    <label className="ui-element ui-size-6">
                        Punchline Studio
                    </label>
                    <div className="actions ui-element ui-size-6 ui-horizontal-right">
                        {

                        }
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
                            width={this.state.card.width}
                            height={this.state.card.height}
                        />
                        {
                            this.state.ready ? null:
                            <div className="ui-container ui-fluid ui-absolute mask">
                                <BlankLoader/>
                            </div>
                        }
                        <input className="ui-element ui-hide" type="file" ref={this.inputFile}/>
                        <div className="ui-container ui-size-fluid ui-unwrap actions ui-all-center">
                            <Button
                                variant="contained"
                                startIcon={<Icon icon="image"/>}
                                onClick={()=>{this.loadImage()}}
                            >
                                L'image de fond
                            </Button>
                            <Button
                                startIcon={<Icon mode="ion" icon="ios-settings-strong"/>}
                                onClick={()=>this.changeValue('showConfig', true)}
                            >
                                Configuration
                            </Button>
                        </div>
                    </div>
                    <div className="ui-container ui-size-fluid ui-md-size-6 data">
                        <div className="ui-element ui-size-6 wrapper">
                            <TextField
                                className="ui-size-fluid"
                                label="Titre du morceau"
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
                                rows={3}
                                value={this.state.lyrics}
                                onChange={(e)=>this.changeValue('lyrics', e.target.value)}
                            />
                        </div>
                        <div className="ui-element ui-size-fluid wrapper">
                            <TextField
                                multiline={true}
                                className="ui-size-fluid"
                                label="Commentaire (facultatif)"
                                rows={2}
                                value={this.state.comment}
                                onChange={(e)=>this.changeValue('comment', e.target.value)}
                            />
                        </div>
                        <Scheduler
                            auto={this.state.auto}
                            date={this.state.date}
                            time={this.state.time}
                            onChange={(data)=>{
                                this.setState(state=>{
                                    return {
                                        ...state,
                                        ...data
                                    }
                                });
                            }}
                        />
                    </div>
                </div>
                <Main.DialogBox
                    title="Configuration du rendu"
                    open={this.state.showConfig}
                    content={(
                        <div className="ui-element ui-size-12 studio-config">
                            <div className="ui-container ui-size-6 wrapper">
                                <TextField
                                    label="Largeur"
                                    className="ui-size-fluid"
                                    size="small"
                                    value={this.state.card.width}
                                    onChange={(e)=>this.setCardConfig('width', e.target.value)}
                                    InputProps={adornment()}
                                />
                            </div>
                            <div className="ui-container ui-size-6 wrapper">
                                <TextField
                                    label="Hauteur"
                                    className="ui-size-fluid"
                                    size="small"
                                    value={this.state.card.height}
                                    onChange={(e)=>this.setCardConfig('height', e.target.value)}
                                    InputProps={adornment()}
                                />
                            </div>
                            <div className="ui-container ui-size-6 wrapper">
                                <Writing.RenderSelect
                                    label="Taille du nom de l'artiste"
                                    list={fontSizes}
                                    value={this.state.card.artistSize}
                                    className="ui-size-fluid"
                                    size="small"
                                    InputProps={adornment('pt')}
                                    onChange={(e)=>this.setCardConfig('artistSize', e.target.value)}
                                />
                            </div>
                            <div className="ui-container ui-size-6 wrapper">
                                <Writing.RenderSelect
                                    label="Taille du text punchline"
                                    list={fontSizes}
                                    className="ui-size-fluid"
                                    size="small"
                                    InputProps={adornment('pt')}
                                    value={this.state.card.textSize}
                                    onChange={(e)=>this.setCardConfig('textSize', e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    buttons={(
                        <Button onClick={()=>this.changeValue('showConfig', false)}>Ok</Button>
                    )}
                />
                {this.renderDialog()}
            </div>
        );
    }
}
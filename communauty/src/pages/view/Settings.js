import AlertableComponent from "./AlertableComponent";
import Field from "../../components/Field";
import {
    Button, Checkbox,
    CircularProgress,
    Divider, FormControlLabel, IconButton,
    List,
    ListItem,
    ListItemText,
    Switch, TextField,
    Typography
} from "@mui/material";
import {Icon} from "../../components/Header";
import Writing from "./Writing";
import {createRef} from "react";
import Main from "../Main";
import Management from "../../utils/Management";
import BlankLoader, {EmptyView} from "../widget/BlankLoader";
import Filter from "../../utils/Filter";
import AkaDatetime from "../../utils/AkaDatetime";
import Constraint from "../../utils/Constraint";
import ResponseCode from "../../utils/ResponseCode";

export default class Settings extends AlertableComponent{

    constructor(props) {
        super(props);
        this.colorInputs = [
            createRef(), createRef(),
            createRef(), createRef()
        ];
        this.state = {
            ...this.getState(),
            readingVisible: false,
            readingVisibleWithCondition: false,
            readingVisibilitylimit: 0,
            likesVisible: false,
            likesVisibleWithCondition: false,
            likesVisibilitylimit: 0,
            authorVisible: false,
            cardBg: '#000',
            cardBandBg: '#fff',
            cardTextColor: '#fff',
            cardBandColor: '#000',
            cardWidth: 400,
            cardHeight: 400,
            filter: '',
            branches: [],
            sponsoredArticles: [],
            sponsoredPunchlines: [],
            old: {
                sponsoredArticles: [],
                sponsoredPunchlines: []
            },
            articles: [],
            punchlines: [],
            target: null,
            pick: false,
            branchCreator: {
                open: false,
                domain: '',
                name: '',
                edit: false
            }
        }
    }

    reload(){
        Management.getEssentials().then((data)=>{
            console.log('[Essentials]',data)
            this.state.old = {
                sponsoredArticles: data.sponsoredArticles,
                sponsoredPunchlines: data.sponsoredPunchlines
            };
            this.changeState({
                loading: false,
                ...data
            });
        }).catch((content)=>{
            this.setReloadable(content);
        })
    }

    componentDidMount() {
        super.componentDidMount();
        this.reload();
    }

    async commit(){
        let query = {};

        query = {...Filter.object(this.state, [
            'readingVisible','likesVisible', 'authorVisible',
            'readingVisibilitylimit', 'likesVisibilitylimit',
            'readingVisibleWithCondition', 'likesVisibleWithCondition'
        ])}

        query = {...query, ...Filter.object(this.state,[
            'cardBg', 'cardBandBg', 'cardTextColor', 'cardBandColor',
            'cardWidth', 'cardHeight'
        ])}

        query = {...query, ...Filter.object(this.state, ['branches'])}

        const listIndex = ['sponsoredArticles','sponsoredPunchlines'];
        let list, found;
        for(let index of listIndex){
            list = this.state[index];
            for(let oldSponsor of this.state.old[index]){
                found = false;
                for(let sponsor of list){
                    if(sponsor.id == oldSponsor.id){
                        found = true;
                    }
                }
                if(!found){
                    list.push({
                        ...oldSponsor,
                        sponsoredUntil: null
                    });
                }
            }
        }
        query = {...query, ...Filter.object(this.state,listIndex)}

        query = {...query, ...Filter.object(this.state, ['branches'])};

        console.log('[Query]',query);
        this.toggleUploadInfo({
            process: 'Mise à jour des configurations en cours...'
        });
        try{
            const data = await Management.setEssentials(query);
            this.changeState({
                ...data.data
            });
            this.toggleDialog({
                content: (
                    !data.message || !data.message.length ?
                        'Configuration du site modifiée !'
                        :
                        data.message.map((text)=>{
                            if(text.code == ResponseCode.SUCCESS) return null;
                            return <p>
                                {Management.readCode(text.code)}, [configuration] {text.config}
                            </p>
                        })
                )
            });
        }catch (content){
            this.toggleDialog({content});
        }
        this.toggleUploadInfo({open: false});
    }

    isDisplayable(value){
        return value.toLowerCase().indexOf(this.state.filter.toLowerCase()) >= 0;
    }

    visibilitiesSettings(){
        const list = [
            {label: "Laisser voir le nombre de vue", state: 'readingVisible'},
            {label: "Fixer une limite minimale", state: 'readingVisibleWithCondition', depend: 'readingVisible'},
            {label: "La limite minimale pour laisser voir le nombre de vue", state: 'readingVisibilitylimit', numbered: true, depend: 'readingVisibleWithCondition'},
            {label: "Laisser voir le nombre d'appréciation", state: 'likesVisible'},
            {label: "Fixer une limite minimale", state: 'likesVisibleWithCondition', depend: 'likesVisible'},
            {label: "La limite minimale pour laisser voir le nombre d'appreciation", state: 'likesVisibilitylimit', numbered: true, depend: 'likesVisibleWithCondition'},
            {label: "Afficher les noms du rédacteur dans les articles", state: 'authorVisible'},
        ];
        return (
            <>
                <br/><br/>
                <li>
                    <Typography variant="caption">
                        Visibilités des statistiques des publications
                    </Typography>
                </li>
                {
                    list.map((data)=>{
                        if(!this.isDisplayable(data.label)){
                            return  null;
                        }
                        const disabled = data.depend && !this.state[data.depend];
                        if(disabled && data.numbered){
                            return null;
                        }
                        if(disabled && !data.numbered){
                            this.state[data.state] = false;
                        }
                        return (
                            <>
                                <ListItem button disabled={disabled} onClick={()=>this.changeValue(data.state, !this.state[data.state])}>
                                    <ListItemText>
                                        {data.label}
                                    </ListItemText>
                                    {
                                        data.numbered ?
                                            <TextField
                                                label={"nombre minimal"}
                                                type="number"
                                                min={20}
                                                size="small"
                                                onBlur={(e)=>{
                                                    this.changeValue(data.state,Constraint.passInt(e.target.value));
                                                }}
                                                value={this.state[data.state]}
                                                onChange={(e)=>this.changeValue(data.state, e.target.value)}
                                            />
                                        :
                                            <Switch
                                                checked={disabled ? false : this.state[data.state]}
                                                onChange={(e)=>this.changeValue(data.state, e.target.checked)}
                                            />
                                    }
                                </ListItem>
                                <Divider light/>
                            </>
                        )
                    })
                }
            </>
        )
    }

    commitSponsor(target, id, edit, value = null){
        const index = target == 'article' ? 'sponsoredArticles': 'sponsoredPunchlines';
        if(edit){
            for (let i in this.state[index]) {
                if (this.state[index][i].id == id) {
                    if (value !== null) {
                        this.state[index][i].sponsoredUntil = value;
                    } else {
                        this.state[index][i].edit = false;
                    }
                    break;
                }
            }
        }
        else{
            if(value === true){ //remove
                this.state[index] = this.state[index].filter((data)=>{
                    if(data.id != id) return true;
                });
            }
            else {
                for (let i in this.state[index]) {
                    if (this.state[index][i].id == id) {
                        this.state[index][i].edit = !edit;
                        break;
                    }
                }
            }
        }
        this.changeValue(index, [...this.state[index]]);
    }

    listItem(target,data){
        return (
            <ListItem>
                <ListItemText>
                    {data.title}
                </ListItemText>
                <div className="ui-container ui-size-5">
                    {
                        !data.edit ?
                            !data.sponsoredUntil || !data.sponsoredUntil.length ? <i>Non sponsorisée</i>
                                :
                                "Jusqu'à "+Management.getDateString(new AkaDatetime(data.sponsoredUntil).getDateTime(), false).toLowerCase()
                            :
                            <TextField
                                size="small"
                                type="date"
                                value={data.sponsoredUntil}
                                onChange={(e)=>this.commitSponsor(target, data.id, true, e.target.value)}
                            />
                    }
                </div>
                <IconButton onClick={()=>{
                    this.commitSponsor(target, data.id, data.edit);
                }}>
                    <Icon icon={data.edit ? "check" : "pen"}/>
                </IconButton>
                <IconButton
                    sx={{color: 'red'}}
                    disabled={data.edit}
                    onClick={()=>{
                        this.commitSponsor(target, data.id, data.edit, true);
                    }}
                >
                    <Icon icon="trash"/>
                </IconButton>
            </ListItem>
        )
    }

    billboardSettings(){
        return (
            <>
                <br/><br/>
                <li className="ui-container ui-size-fluid group ui-horizontal-left">
                    <Typography className="ui-size-fluid" variant="caption">
                        Sponsorisation des articles
                    </Typography>
                </li>
                <List>
                    {
                        !this.state.sponsoredArticles.length ?
                            <EmptyView text="Aucun article sponsorisé"/>
                        :
                        this.state.sponsoredArticles.map((data)=>{
                            return this.listItem('article',data);
                        })
                    }
                </List>
                <Button
                    className="mui-button"
                    startIcon={<Icon icon="list"/>}
                    onClick={()=>this.setPicker('article')}
                >
                    Voir la liste des articles
                </Button>
                <br/><br/>
                <li className="ui-container ui-size-fluid group ui-horizontal-left">
                    <Typography className="ui-size-fluid" variant="caption">
                        Sponsorisation des punchlines
                    </Typography>
                </li>
                <List>
                    {
                        !this.state.sponsoredPunchlines.length ?
                            <EmptyView text="Aucune punchline sponsorisée"/>
                            :
                            this.state.sponsoredPunchlines.map((data)=>{
                                return this.listItem('punchline',data);
                            })
                    }
                </List>
                <Button
                    className="mui-button"
                    startIcon={<Icon icon="list"/>}
                    onClick={()=>this.setPicker('punchline')}
                >
                    Voir la liste des punchlines
                </Button>
                <Main.DialogBox
                    open={this.state.pick}
                    title="Sélection"
                    content={this.renderPickList()}
                    buttons={[
                        <Button
                            className="mui-button"
                            onClick={()=>this.setPicker(false, true)}
                        >Annuler</Button>,
                        <Button
                            className="mui-button"
                            variant="contained"
                            onClick={()=>this.setPicker(false)}
                        >Choisir</Button>
                    ]}
                />
            </>
        )
    }

    punchlineSettings(){
        const texts = [
            'Dimension par défaut des cartes'
        ];
        const options = [
            {label:"Couleur du fond d'arrière-plan des cartes", state: 'cardBg', index: 0},
            {label:"Couleur du texte des punchlines", state: 'cardTextColor', index: 1},
            {label: "Couleur du fond de la bande", state: 'cardBandBg', index: 2},
            {label: "Couleur du texte du nom de l'artiste", state: 'cardBandColor', index: 3}
        ];
        return (
            <>
                <br/><br/>
                <li className="ui-container ui-size-fluid group ui-horizontal-left">
                    <Typography className="ui-size-fluid" variant="caption">
                        Configuration par défaut des punchlines
                    </Typography>
                </li>
                {
                    !this.isDisplayable(texts[0]) ? null :
                    <ListItem divider>
                        <ListItemText>
                            {texts[0]}
                        </ListItemText>
                        <div className="ui-container ui-size-5 ui-vertical-center">
                            <Writing.TextField
                                label="largeur"
                                className="ui-size-5"
                                size="small"
                                type="number"
                                endIcon={"px"}
                                value={this.state.cardWidth}
                                onChange={(e)=>this.changeValue('cardWidth', e.target.value)}
                            />
                            <label className="ui-element ui-size-2 ui-horizontal-center">par</label>
                            <Writing.TextField
                                label="largeur"
                                className="ui-size-5"
                                size="small"
                                type="number"
                                endIcon={"px"}
                                value={this.state.cardHeight}
                                onChange={(e)=>this.changeValue('cardHeight', e.target.value)}
                            />
                        </div>
                    </ListItem>
                }
                {
                    options.map((data)=>{
                        return !this.isDisplayable(data.label) ? null:
                        <ListItem divider>
                            <ListItemText>{data.label}</ListItemText>
                            <div
                                className="ui-container color-intent"
                                style={{backgroundColor: this.state[data.state]}}
                                onClick={()=>{
                                    this.colorInputs[data.index].current.click()
                                }}
                            >
                                <input
                                    className="ui-hide"
                                    type="color"
                                    value={this.state[data.state]}
                                    ref={this.colorInputs[data.index]}
                                    onChange={(e)=>this.changeValue(data.state, e.target.value)}
                                />
                            </div>
                        </ListItem>
                    })
                }
            </>
        )
    }

    changeBranchEditorData(index, value){
        this.changeValue('branchCreator', {
            ...this.state.branchCreator,
            [index]: value
        });
    }

    commitBranch(add = true){
        const data = Filter.object(this.state.branchCreator, ['name','domain']);
        const edit = this.state.branchCreator.edit;
        let exist = false;
        let branch = {};
        console.log({add, data});
        this.state.branches = this.state.branches.filter((value)=>{
            const matched = (
                value.name.replace(/[ '-]+/, ' ').toLowerCase() == data.name.replace(/[ '-]+/, ' ').toLowerCase() ||
                value.domain.replace(/[.]+/, '') == data.domain.replace(/[.]+/, '').toLowerCase()
            )
            if(!add && matched){
                value.delete = true;
            }
            if(matched){
                branch = value;
            }
            return true;
        })
        if(add) {
            if(Object.keys(branch).length){
                if(!edit) {
                    return this.toggleDialog({
                        content: Management.readCode(ResponseCode.DOMAIN_EXIST_ERROR)
                    });
                }
                exist = true;
            }
            if(exist && branch.delete){
                delete branch.delete;
            }
            else {
                branch = {...branch, ...data};
            }
            if (!exist) {
                this.state.branches.push(branch);
            }
        }
        this.changeState({
            branches: [...this.state.branches],
            branchCreator: {
                open: false,
                domain: '',
                name: '',
                edit: false
            }
        });
    }

    branchSettings(){
        return (
            <>
                <br/><br/>
                <li className="ui-container ui-size-fluid group ui-horizontal-left">
                    <Typography className="ui-size-fluid" variant="caption">
                        Les filiales
                    </Typography>
                </li>
                {
                    !this.state.branches.length ?
                        <EmptyView text="Aucune filiale n'a été trouvé"/>
                    :
                    this.state.branches.map((data)=>{
                        return (
                            <ListItem key={data.id} divider>
                                <ListItemText sx={{
                                    color: data.delete ? 'red' : 'black'
                                }}>
                                    {data.name}
                                    <i>({data.domain})</i>
                                </ListItemText>
                                <div className="ui-container ui-size-3">
                                    <IconButton
                                        disabled={Boolean(data.delete)}
                                        onClick={()=>{
                                            this.changeValue('branchCreator',{
                                                open: true,
                                                domain: data.domain,
                                                name: data.name,
                                                edit: true
                                            })
                                        }}
                                    >
                                        <Icon icon="pen"/>
                                    </IconButton>
                                    <IconButton
                                        sx={{color: data.delete ? 'black' : 'red'}}
                                        onClick={()=>{
                                            this.state.branchCreator = {
                                                open: false,
                                                domain: data.domain,
                                                name: data.name,
                                                edit: Boolean(data.delete)
                                            };
                                            this.commitBranch(Boolean(data.delete))
                                        }}
                                    >
                                        <Icon icon={!data.delete ? "trash" : "undo"}/>
                                    </IconButton>
                                </div>
                            </ListItem>
                        )
                    })
                }
                <br/><br/>
                <Button
                    className="mui-button"
                    startIcon={<Icon icon="plus"/>}
                    onClick={()=>this.changeBranchEditorData('open', true)}
                >
                    Enregistrer une nouvelle filiale
                </Button>
                {/* ----- Branch creator ----- */}
                <Main.DialogBox
                    open={this.state.branchCreator.open}
                    title="Filiale"
                    content={
                        <>
                            <div className="ui-container ui-size-fluid wrapper">
                                <TextField
                                    label="Nom de domaine de la filiale"
                                    placeholder="Exemple : nomdomain.com"
                                    value={this.state.branchCreator.domain}
                                    onBlur={(e)=>this.changeBranchEditorData('domain', Constraint.passDomain(e.target.value))}
                                    onChange={(e)=>this.changeBranchEditorData('domain', e.target.value)}
                                    helperText="seuls les lettres en minuscule(a-z), les chiffres(0-9), les points(.) et les tirets(-) sont acceptés."
                                />
                            </div>
                            <div className="ui-container ui-size-fluid wrapper">
                                <TextField
                                    label="Nom de la filiale"
                                    value={this.state.branchCreator.name}
                                    onBlur={(e)=>this.changeBranchEditorData('name', Constraint.passBranchName(e.target.value))}
                                    onChange={(e)=>this.changeBranchEditorData('name', e.target.value)}
                                    helperText="Donnez un nom correct et logique s.v.p"
                                />
                            </div>
                        </>
                    }
                    buttons={[
                        <Button
                            className="mui-button"
                            onClick={()=>this.changeBranchEditorData('open', false)}
                        >Annuler</Button>,
                        <Button
                            className="mui-button"
                            variant="contained"
                            disabled={!this.state.branchCreator.name.length || !this.state.branchCreator.domain.length}
                            onClick={()=> this.commitBranch()}
                        >Enregistrer</Button>
                    ]}
                />
            </>
        )
    }

    isChecked(data,target){
        const list = this.state[target == 'article' ? 'sponsoredArticles': 'sponsoredPunchlines'];
        for(let i in list){
            if(list[i].id == data.id){
                return true;
            }
        }
        return false;
    }

    check(data, add, target){
        const index = target == 'article' ? 'sponsoredArticles': 'sponsoredPunchlines';
        if(add && !this.isChecked(data,target)){
            this.state[index].push(data);
        }
        else if(!add){
            this.state[index] = this.state[index].filter((val)=>{
                if(val.id != data.id){
                    return true;
                }
            });
        }
        this.changeValue(index, [...this.state[index]]);
    }

    renderPickList(){
        const target = this.state.target;
        if(!target){
            return (
                <div className="ui-container ui-size-fluid ui-all-center">
                    <CircularProgress/>
                </div>
            );
        }
        const data = this.state[target+'s'];
        return  (
            <div className="ui-container ui-size-fluid">
                <List className="ui-container ui-size-fluid">
                    {data.map((data)=>{
                        return (
                            <ListItem key={data.id}>
                                <FormControlLabel
                                    control={<Checkbox
                                        checked={this.isChecked(data, target)}
                                        onChange={(e)=>this.check(data, !this.isChecked(data,target), target)}
                                    />}
                                    label={data.title}
                                />
                            </ListItem>
                        )
                    })}
                </List>
            </div>
        );
    }

    async setPicker(target = null, reset=false){
        if(target == 'article'){
            try {
                const data = await Management.getArticle();
                this.changeState({
                    pick: true,
                    target: target,
                    articles: data.map((data)=>{
                        return {
                            edit: false,
                            ...Filter.object(data, ['id','title', 'sponsoredUntil'])
                        };
                    })
                });
            }catch (content) {
                this.setPicker(false, true)
                this.toggleSnack({content})
            }
        }
        else if(target == 'punchline'){
            try{
                const data = await Management.getPunchlinesData();
                this.changeState({
                    pick: true,
                    target: target,
                    punchlines: data.data.map((data)=>{
                        return {
                            edit: false,
                            ...Filter.object(data, ['id','title', 'sponsoredUntil'])
                        };
                    })
                });
            }catch (content){
                this.setPicker(false, true)
                this.toggleSnack({content})
            }
        }
        else{
            this.changeState({
                pick: false,
                target: null,
                sponsoredArticles: reset && target == 'article' ? [] : this.state.sponsoredArticles,
                sponsoredPunchlines: reset && target == 'punchline' ? [] : this.state.sponsoredPunchlines,
            });
        }
    }

    render() {
        if(this.block = this.blockRender()) return this.block;
        return (
            <div className="ui-container ui-fluid settings ui-horizontal-center">
                <div className="ui-container ui-unwrap ui-fluid-height ui-column ui-size-fluid ui-sm-size-10 ui-md-size-8 ui-horizontal-left">
                    <div className="ui-container ui-size-fluid header">
                        <div className="ui-container ui-size-fluid ui-unwrap">
                            <h1 className="ui-element ui-size-8 ellipsis-text">Gestion du site web </h1>
                            <div className="ui-container ui-size-4">
                                <Button
                                    className="mui-button"
                                    startIcon={<Icon icon="save"/>}
                                    onClick={()=>this.commit()}
                                >
                                    Enregistrer
                                </Button>
                            </div>
                        </div>
                        <Field
                            placeholder="rechercher une configuration"
                            className="ui-size-8 ui-sm-size-7 ui-md-size-6 search-zone"
                            value={this.state.filter}
                            onChange={(e)=>this.changeValue('filter', e.target.value)}
                        />
                    </div>
                    <div className="ui-container ui-size-fluid ui-scroll-y">
                        <List className="ui-size-fluid">
                            {this.visibilitiesSettings()}
                            {this.punchlineSettings()}
                            {this.billboardSettings()}
                            {this.branchSettings()}
                        </List>
                    </div>
                </div>
                {this.renderDialog()}
            </div>
        )
    }
}
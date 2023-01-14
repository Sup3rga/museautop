import AlertableComponent from "./AlertableComponent";
import {Button, Checkbox, FormControlLabel, TextField} from "@mui/material";
import {Icon} from "../../components/Header";
import Writing from "./Writing";
import Management from "../../utils/Management";
import BlankLoader from "../widget/BlankLoader";

export default class Integration extends AlertableComponent{

    constructor(props) {
        super(props);
        this.groups = {};
        this.state = {
            firstname: '',
            lastname: '',
            nickname: '',
            email: '',
            phone: '',
            groupsDesc: {},
            groups: [],
            privileges: [],
            privilegesDesc: {},
            loading: true,
            choice: []
        }
    }


    componentDidMount() {
        super.componentDidMount();
        Management.fetchPrivilegies().then((data)=>{
            console.log('[Data]',data);
            const privileges = Object.keys(data.privilegies);
            let bounds,items;
            for(let i in data.groups){
                bounds = data.groups[i];
                this.groups[i] = [];
                for(let k in privileges){
                    items = privileges[k] * 1;
                    if(items >= bounds[0] && items <= bounds[1]){
                        this.groups[i].push(items);
                    }
                }
            }
            console.log('[groups]',this.groups);
            this.changeState({
                groups: Object.keys(data.groups),
                groupsDesc: data.groups,
                privileges,
                privilegesDesc: data.privilegies,
                loading: false
            });
        }).catch((message)=>{
            console.log('[Error]',message);
        })
    }

    setChoice(privilege, add = true, render = true){
        if(add){
            if(this.state.choice.indexOf(privilege) < 0){
                this.state.choice.push(privilege);
            }
        }
        else{
            this.state.choice = this.state.choice.filter((e)=>{
                if(e != privilege) return e;
            });
        }
        if(render) {
            this.changeState({
                choice: this.state.choice
            });
        }
    }

    getGroupChoice(name){
        return 0;
        let val = 0, total = 0, checked = 0,
            list = this.groups[name],
            bounds = this.state.groupsDesc[name];
        for(let i in list){
            if(list[i] >= bounds[0] & list[i] <= bounds[1]){
                total++;
                if(this.state.choice.indexOf(list[i]) >= 0){
                    checked++;
                }
            }
        }
        return total === checked && total > 0 ? 2 : checked > 0 ? 1 : 0;
    }

    isChecked(index){
        return this.state.choice.indexOf(index) >= 0;
    }

    checkAll(name, check){
        const list = this.groups[name];
        const bounds = this.state.groupsDesc[name];
        console.log('[Name]',{name,list,bounds});
        for(let i in list){
            list[i] *= list[i];
            if(list[i] >= bounds[0] && list[i] <= bounds[1]){
                this.setChoice(list[i], check, false);
            }
        }
        this.changeState({
            choice: this.state.choice
        });
    }

    render(){
        if(this.state.loading) return <BlankLoader/>
        return (
            <div className="ui-container ui-fluid ui-unwrap ui-column integration">
                <div className="ui-container ui-size-fluid header ui-vertical-center">
                    <h1 className="ui-size-fluid ui-md-size-9 ui-container name">
                        Intégration de membre
                    </h1>
                    <div className="ui-size-fluid ui-md-size-3 ui-horizontal-right">
                        <Button
                            sx={{
                                textTransform: 'capitalize'
                            }}
                            startIcon={<Icon icon="save"/>}
                        >
                            Enregistrer les informations
                        </Button>
                    </div>
                </div>
                <div className="ui-container ui-fluid ui-scroll-y ui-all-center">
                    <div className="ui-element form ui-size-fluid ui-md-size-6">
                        <div className="ui-container ui-size-fluid ui-md-size-6 wrapper">
                            <TextField
                                className="ui-size-fluid"
                                label="Le nom"
                                size="small"
                            />
                        </div>
                        <div className="ui-container ui-size-fluid ui-md-size-6 wrapper">
                            <TextField
                                className="ui-size-fluid"
                                label="Le Prénom"
                                size="small"
                            />
                        </div>
                        <div className="ui-container ui-size-fluid wrapper">
                            <TextField
                                className="ui-size-fluid"
                                label="Pseudo"
                                size="small"
                                placeholder="my.pseudo"
                                helperText={`Aucun espace ne sera autorisé, 
                                    ni de caractères spéciaux, 
                                    seuls les lettres comprises entre A à Z (en évitant les lettres accentuées),
                                    et les chiffes, sont admisibles
                                `}
                            />
                        </div>
                        <div className="ui-container ui-size-fluid wrapper">
                            <TextField
                                className="ui-size-fluid"
                                label="Adresse e-mail"
                                size="small"
                                placeholder="Exemple: myname@webmail.com"
                            />
                        </div>
                        <div className="ui-container ui-size-fluid wrapper">
                            <Writing.AutoCompletion
                                label="Numéro de téléphone"
                                className="ui-size-fluid"
                                placeholder="XXX XXXXXXXXXXX"
                                startIcon={'+'}
                            />
                        </div>
                        <br/><br/>
                        <h2 className="ui-element ui-horizontal-left ui-size-fluid">
                            Assignation de privilèges
                        </h2>
                        <div className="ui-container ui-size-fluid privilegies-list">
                            <FormControlLabel
                                disabled={true}
                                control={<Checkbox defaultChecked />}
                                label={this.state.privilegesDesc[0]}
                            />
                            {
                                this.state.groups.map((name, key)=>{
                                    const intervals = this.state.groupsDesc[name];
                                    const state = this.getGroupChoice(name);
                                    console.log('[State]',state);
                                    return (
                                        <>
                                            <div className="ui-container ui-size-fluid privileges-group">
                                                <FormControlLabel
                                                    key={name}
                                                    control={<Checkbox
                                                        checked={state == 2}
                                                        indeterminate={state == 1}
                                                        onChange={(e)=>this.checkAll(name, e.target.checked)}
                                                    />}
                                                    label={name}
                                                />
                                            </div>
                                            <div className="ui-container ui-size-fluid privilegies-items">
                                                {
                                                    this.groups[name].map((index)=>{
                                                        index *= 1;
                                                        if(index < intervals[0] || index > intervals[1]){
                                                            return null;
                                                        }
                                                        return (
                                                            <div className="ui-container ui-size-fluid privilege">
                                                                <FormControlLabel
                                                                    disabled={index == intervals[0]}
                                                                    key={index}
                                                                    control={
                                                                        <Checkbox
                                                                            checked={(index == intervals[0] && state > 0) || (this.isChecked(index))}
                                                                            onChange={(e)=>this.setChoice(index, e.target.checked)}
                                                                        />}
                                                                    label={this.state.privilegesDesc[index]}
                                                                />
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
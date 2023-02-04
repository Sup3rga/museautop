import AlertableComponent from "./AlertableComponent";
import {Button, Checkbox, Chip, CircularProgress, FormControlLabel, IconButton, TextField} from "@mui/material";
import {Icon} from "../../components/Header";
import Writing from "./Writing";
import Management from "../../utils/Management";
import BlankLoader from "../widget/BlankLoader";
import Filter from "../../utils/Filter";
import Constraint from "../../utils/Constraint";
import Route from "../../utils/Route";
import Url from "../../utils/Url";
import AuthBox from "../widget/AuthBox";
import Events from "../../utils/Events";
import Main from "../Main";

export default class Integration extends AlertableComponent{

    constructor(props) {
        super(props);
        this.groups = {};
        this.branches = Main.getBranchOptions();
        this.state = {
            ...super.getState(),
            firstname: '',
            self: false,
            lastname: '',
            nickname: '',
            email: '',
            phone: '',
            password: '',
            showPassword: false,
            groupsDesc: {},
            groups: [],
            privileges: [],
            privilegesDesc: {},
            branches: [],
            currentBranch: 0,
            branchSelected: null,
            loading: true,
            checkingNicknameStatus : false,
            checkingEmailStatus: false,
            nicknameStatus: 0,
            emailStatus: 0,
            choice: {},
            edit: null,
            authenticate: false
        }
        this.required = ['firstname', 'lastname', 'nickname', 'email', 'phone', 'password'];
        this.nickNameReport = [
            `Aucun espace ne sera autorisé, 
                ni de caractères spéciaux, 
                seuls les lettres comprises entre A à Z (en évitant les lettres accentuées),
                le point (.) et les chiffes, sont admisibles
            `,
            `Ce nom d'utilisateur n'est pas disponible`,
            `Nom d'utilisateur autorisé !`
        ];
        this.emailReport = [
            '',
            'Cette adresse e-mail est déjà utilisée !',
            'Adresse e-mail autorisé !'
        ];
    }

    reload() {
        Management.fetchPrivilegies().then(async(data)=>{
            const privileges = data.own;//Object.keys(data.privileges);
            let bounds,items;
            if(!Management.isGranted(400)){
                return this.banForPrivilege();
            }
            for(let i in data.groups){
                bounds = data.groups[i];
                this.groups[i] = [];
                for(let k in privileges){
                    items = privileges[k] * 1;
                    if(items >= bounds[0] && items <= bounds[1]){
                        this.groups[i].push(items);
                    }
                }
                if(!this.groups[i].length){
                    delete this.groups[i];
                }
            }
            let state = {};
            if(/^\/communauty\/integration\/([0-9]+)$/.test(Url.get())){
                const id = RegExp.$1;
                if(!Management.isGranted(402)){
                    return this.banForPrivilege();
                }
                const edit = id == Management.data.id ? Management.data : await Management.getMemberData(id);
                Object.keys(edit.branches).map(branch=>{
                    edit.branches[branch] = edit.branches[branch].map(e => e * 1);
                });
                state = {
                    self: edit.id == Management.data.id,
                    firstname: edit.firstname,
                    lastname: edit.lastname,
                    nickname: edit.nickname,
                    email: edit.mail,
                    phone: edit.phone,
                    edit,
                    nicknameStatus: 2,
                    emailStatus: 2,
                    choice: edit.branches,
                    branches: Object.keys(edit.branches)
                }
                this.required.pop();
            }
            this.changeState({
                ...state,
                groups: Object.keys(this.groups),
                groupsDesc: data.groups,
                privileges,
                privilegesDesc: data.privileges,
                loading: false
            });
        }).catch(this.setReloadable.bind(this))
    }

    componentDidMount() {
        super.componentDidMount();
        this.reload();
    }

    setChoice(privilege, add = true, render = true){
        if(add){
            if(this.state.choice[this.state.currentBranch].indexOf(privilege) < 0){
                this.state.choice[this.state.currentBranch].push(privilege);
            }
        }
        else{
            this.state.choice[this.state.currentBranch] = this.state.choice[this.state.currentBranch].filter((e)=>{
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
        let total = 0, checked = 0,
            list = this.groups[name],
            bounds = this.state.groupsDesc[name];
        for(let i in list){
            if(list[i] >= bounds[0] & list[i] <= bounds[1]){
                total++;
                if(this.state.choice[this.state.currentBranch].indexOf(list[i]) >= 0){
                    checked++;
                }
            }
        }
        return total === checked && total > 0 ? 2 : checked > 0 ? 1 : 0;
    }

    isChecked(index){
        return this.state.choice[this.state.currentBranch].indexOf(index) >= 0;
    }

    checkAll(name, state){
        const list = this.groups[name];
        let check;
        for(let i in list){
            check = !state ? (i == 0 ? true : false) : (state == 1 ? true : false);
            this.setChoice(list[i], check, false);
        }
        this.changeState({
            choice: this.state.choice
        });
    }

    isReady(){
        const canSetPrivilege = Management.isGranted(407);
        return Filter.contains(this.state, this.required, [null,'']) &&
            (Object.keys(this.state.choice).length || !canSetPrivilege);
    }

    async submit(auth=null){
        if(!this.isReady()){
            return;
        }
        let required = [...this.required];
        if(this.state.self && this.state.password.length){
            required.push('password');
        }
        const query = Filter.object(this.state,required);
        if(Management.isGranted(407)){
           query.privileges = this.state.choice;
        }
        if(!auth){
            return this.changeValue('authenticate', true);
        }
        query.auth = auth;
        if(this.state.edit){
            query.id = this.state.edit.id;
        }
        this.toggleUploadInfo({
            text: (query.id ? "Mise à jour" : "Enregistrement")+" des données en cours..."
        });
        try{
            await Management.integrateNewManager(query);
            this.toggleDialog({
                content: query.id ? "Informations modifiées !" : "Vous venez d'intégrer un nouveau membre !"
            });
            if(this.state.self){
                Events.emit("personal-data-updated");
            }
            Route.back();
        }catch (content){
            this.toggleDialog({content})
        }
        this.toggleUploadInfo({open:false});
    }

    initBranch(index){
        if(!(index in this.state.choice)){
            this.state.choice[index] = [0];
        }
        this.changeState({
            currentBranch: index,
            choice: this.state.choice
        });
    }

    addBranch(){
        if(this.state.branches.indexOf(this.state.branchSelected) < 0){
            this.state.branches.push(this.state.branchSelected);
            this.changeValue('branches', this.state.branches);
            this.initBranch(this.state.branchSelected);
        }
    }

    removeBranch(branch){
        if(this.state.branches.indexOf(branch) >= 0){
            this.state.branches = this.state.branches.filter((val)=>{
                if(val != branch) return true;
            });
            delete this.state.choice[branch];
            this.changeState({
                choice: this.state.choice,
                branches: this.state.branches,
                currentBranch: this.state.currentBranch == branch || !this.state.branches.length ? null : this.state.currentBranch
            });
        }
    }

    async checkId(which,value){
        if(which === 'email'){
            const response = await Management.checkForEmailAvailability(value, this.state.edit ? this.state.edit.id : null);
            this.changeState({
                checkingEmailStatus: false,
                emailStatus: response ? 2 : 1
            });
        }
        else{
            const response = await Management.checkForNickNameAvailability(value, this.state.edit ? this.state.edit.id : null);
            this.changeState({
                checkingNicknameStatus: false,
                nicknameStatus: response ? 2 : 1
            });
        }
    }

    renderPrivileges(){
        return (
            <>
                <h2 className="ui-element ui-horizontal-left ui-size-fluid">
                    Assignation de filiale
                </h2>
                <br/><br/>
                <div className="ui-container ui-size-fluid ui-unwrap ui-vertical-center branch">
                    <Writing.RenderSelect
                        label="Filiale"
                        variant="outlined"
                        className="ui-size-8"
                        onChange={(e)=>this.changeValue('branchSelected',e.target.value)}
                        size="small"
                        value={this.state.branchSelected}
                        list={this.branches}
                    />
                    <span className="ui-element ui-size-1"/>
                    <Button
                        sx={{
                            backgroundColor: '#ccc',
                            color: '0b1a2d',
                            textTransform: 'capitalize'
                        }}
                        className="ui-size-10"
                        disabled={!this.state.branchSelected}
                        onClick={()=>this.addBranch()}
                    >
                        <Icon icon="plus"/> Assigner à cette filiale
                    </Button>
                </div>
                <div className="ui-container ui-size-fluid branch">
                    {
                        this.state.branches.map((index)=>{
                            return <Chip
                                variant={this.state.currentBranch == index ? 'filled' : 'outlined'}
                                label={this.branches[index]}
                                onDelete={()=>this.removeBranch(index)}
                                onClick={()=>this.changeValue('currentBranch', index)}
                            />
                        })
                    }
                </div>
                {
                    !this.state.currentBranch ? null :
                        <>
                            <br/><br/>
                            <h2 className="ui-element ui-horizontal-left ui-size-fluid">
                                Assignation de privilèges
                            </h2>
                            <div className="ui-container ui-size-fluid privilegies-list ui-horizontal-left">
                                <FormControlLabel
                                    disabled={true}
                                    control={<Checkbox defaultChecked />}
                                    label={this.state.privilegesDesc[0]}
                                />
                                {
                                    this.state.groups.map((name, key)=>{
                                        const intervals = this.state.groupsDesc[name];
                                        const state = this.getGroupChoice(name);
                                        if(state > 0 && !this.isChecked(intervals[0])){
                                            console.log('[intrvals]',intervals[0]);
                                            this.setChoice(intervals[0], true, false);
                                        }
                                        return (
                                            <>
                                                <div className="ui-container ui-size-fluid privileges-group">
                                                    <FormControlLabel
                                                        key={name}
                                                        control={<Checkbox
                                                            checked={state == 2}
                                                            indeterminate={state == 1}
                                                            onChange={(e)=>this.checkAll(name, state)}
                                                        />}
                                                        label={name}
                                                    />
                                                </div>
                                                <div className="ui-container ui-size-fluid privilegies-items">
                                                    {
                                                        this.groups[name].map((index)=>{
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
                        </>
                }
            </>
        )
    }

    render(){
        if(this.block = this.blockRender()) return this.block;
        const canSetPrivilege = Management.isGranted(407);
        const ready = this.isReady();
        return (
            <div className="ui-container ui-fluid ui-unwrap ui-column integration">
                <div className="ui-container ui-size-fluid header ui-vertical-center">
                    <h1 className="ui-size-fluid ui-md-size-8 ui-container name">
                        Intégration de membre
                    </h1>
                    <div className="ui-size-fluid ui-md-size-4 ui-horizontal-right">
                        <Button
                            sx={{
                                textTransform: 'capitalize'
                            }}
                            disabled={
                                !ready || this.state.nicknameStatus !== 2 ||
                                this.state.emailStatus !== 2
                            }
                            startIcon={<Icon icon="save"/>}
                            onClick={()=>this.submit()}
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
                                label="Le Prénom"
                                size="small"
                                value={this.state.firstname}
                                onChange={(e)=>this.changeValue('firstname', Constraint.toFormalName(e.target.value))}
                            />
                        </div>
                        <div className="ui-container ui-size-fluid ui-md-size-6 wrapper">
                            <TextField
                                className="ui-size-fluid"
                                label="Le nom"
                                size="small"
                                value={this.state.lastname}
                                onChange={(e)=>this.changeValue('lastname', Constraint.toFormalName(e.target.value))}
                            />
                        </div>
                        <div className="ui-container ui-size-fluid wrapper">
                            <Writing.TextField
                                className="ui-size-fluid"
                                label="Pseudo"
                                size="small"
                                placeholder="Exemple: my.pseudo"
                                helperText={this.nickNameReport[this.state.nicknameStatus]}
                                value={this.state.nickname}
                                endIcon={
                                    this.state.checkingNicknameStatus ?
                                    <CircularProgress size="14px"/> :
                                        !this.state.nicknameStatus ? null :
                                            <Icon mode="ion" icon={
                                                this.state.nicknameStatus == 1 ? "alert-circled" : "android-done"
                                            }/>
                                }
                                onBlur={()=>{
                                    const nick = Constraint.passNickname(this.state.nickname);
                                    if(nick.length){
                                        this.checkId('nickname', nick);
                                    }
                                    this.changeState({
                                        nickname: nick,
                                        checkingNicknameStatus: nick.length > 0
                                    })
                                }}
                                onChange={(e)=>{
                                    this.changeState({
                                        nicknameStatus: 0,
                                        checkingNicknameStatus: false,
                                        nickname: e.target.value
                                    });
                                }}
                            />
                        </div>
                        {
                            this.state.edit && !this.state.self ? null :
                            <div className="ui-container ui-size-fluid wrapper">
                                <Writing.TextField
                                    className="ui-size-fluid"
                                    label={this.state.self ? "Nouveau mot de passe" : "Mot de passe"}
                                    size="small"
                                    value={this.state.password}
                                    type={this.state.showPassword ? 'text' : 'password'}
                                    helperText={!this.state.self ? null : "Vous pouvez modifier votre mot de passe si vous le voulez."}
                                    onChange={(e)=>this.changeValue('password', e.target.value)}
                                    endIcon={
                                        <Icon
                                            icon={this.state.showPassword ? "eye-slash" : "eye"}
                                            onClick={()=>this.changeValue('showPassword', !this.state.showPassword)}/>
                                    }
                                />
                            </div>
                        }
                        <div className="ui-container ui-size-fluid wrapper">
                            <Writing.TextField
                                className="ui-size-fluid"
                                label="Adresse e-mail"
                                size="small"
                                placeholder="Exemple: myname@webmail.com"
                                helperText={this.emailReport[this.state.emailStatus]}
                                endIcon={
                                    this.state.checkingEmailStatus ?
                                        <CircularProgress size="14px"/> :
                                        !this.state.emailStatus ? null :
                                            <Icon mode="ion" icon={
                                                this.state.emailStatus == 1 ? "alert-circled" : "android-done"
                                            }/>
                                }
                                value={this.state.email}
                                onBlur={()=>{
                                    const mail = Constraint.passEmail(this.state.email);
                                    if(mail.length){
                                        this.checkId('email',mail);
                                    }
                                    this.changeState({
                                        email: mail,
                                        checkingEmailStatus: mail.length > 0
                                    })
                                    this.changeValue('email', mail);
                                }}
                                onChange={(e)=>{
                                    this.changeState({
                                        emailStatus: 0,
                                        checkingEmailStatus: false,
                                        email: e.target.value
                                    });
                                }}
                            />
                        </div>
                        <div className="ui-container ui-size-fluid wrapper">
                            <Writing.TextField
                                label="Numéro de téléphone"
                                className="ui-size-fluid"
                                placeholder="XXX XXXXXXXXXXX"
                                startIcon={'+'}
                                value={this.state.phone}
                                onBlur={()=>this.changeValue('phone', Constraint.passPhone(this.state.phone))}
                                onChange={(e)=>this.changeValue('phone', e.target.value)}
                            />
                        </div>
                        <br/><br/>
                        {
                            this.state.self || !canSetPrivilege ? null: this.renderPrivileges()
                        }
                    </div>
                </div>
                <AuthBox
                   title={"Authentification"}
                   open={this.state.authenticate}
                   onSubmit={(auth)=>{
                       this.changeValue('authenticate',false);
                       this.submit(auth);
                   }}
                   onAbort={()=>this.changeValue('authenticate',false)}
                />
                {this.renderDialog()}
            </div>
        )
    }
}
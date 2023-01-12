import React from 'react';
import Link from "../components/Link";
import {Icon} from "../components/Header";
import Avatar from "../components/Avatar";
import Management from "../utils/Management";
import Url from "../utils/Url";
import Events from "../utils/Events";
import Writing from "./view/Writing";
import Ressources from "../utils/Ressources";
import {io} from 'socket.io-client'
import Route from "../utils/Route";
import {
    BottomNavigation,
    BottomNavigationAction,
    Button,
    Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem
} from "@mui/material";

export default class Main extends React.Component{

    static socket = null;
    static branch = null;

    constructor(props) {
        super(props);
        this.list = [
            ["/","/writing","/studio","/communauty","/messenging"],
            ["/writing","/studio","/","/communauty","/messenging"]
        ];
        Main.retryConnection();
        this.routes = Management.getRoutes();
        this.mounted = false;
        this.branches = {};
        for(let i in Management.data.branches){
            if(!Main.branch){
                Main.branch = Management.data.branches[i].id;
            }
            this.branches[Management.data.branches[i].id] = Management.data.branches[i].domain;
        }
        // console.log('[Man]',this.branches);
        this.state = {
            route: Url.get(),
            expanded: false,
            back: false,
            bottomValue: 0,
            userMenu: null,
            branch: Main.branch,
            dialogBox: {
                open: false,
                title: null,
                content: ''
            }
        }
    }

    static retryConnection(){
        Main.socket = io.connect(Ressources.apis);
        Main.socket.on("connected", ()=>{
            console.log('[Connected]');
            Events.emit('connected');
        })
    }

    static retryStorage(){

    }

    componentDidMount() {
        this.mounted = true;
        window.addEventListener("popstate", ()=>{
            this.setState(state=>{
                return {
                    ...state,
                    route: Url.get()
                }
            })
        });
        Events.on("nav", (args)=>{
            this.setState(state=>{
                return {
                    ...state,
                    route: args.href
                }
            })
        },this)
        .on('set-prev', (value)=>{
            this.setState(state=>{
                return {
                    ...state,
                    back: value
                }
            })
        },this);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    changeBranch(e){
        Main.branch = e;
        Events.emit('branch-switch', e);
        this.setState(state => {
            return {
                ...state,
                branch: e
            }
        })
    }

    static DialogBox(props){
        let {title = null} = props;
        return (
            <Dialog
                open={props.open}
                onClose={props.onClose}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {props.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {
                        props.buttons
                    }
                </DialogActions>
            </Dialog>
        )
    }

    toggleDialogBox(open){
        this.setState(state=>{
            return {
                ...state,
                dialogBox: {
                    ...state.dialogBox,
                    open: open
                }
            }
        })
    }

    static MenuList(props){
        return (
            <Menu
            anchorEl={props.el}
            onClose={props.onClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right'
            }}
            sx={{
                mt: '45px'
            }}
            open={Boolean(props.el)}
            >
                {
                    props.list.map((data,index)=>{
                        return (
                            <MenuItem key={index} onClick={data.click ? data.click : props.onClick}>
                                {data.icon} {data.label}
                            </MenuItem>
                        )
                    })
                }
            </Menu>
        )
    }

    renderView(){
        let url = Url.get(),
            view = null;

        if(url == '/'){
            return this.routes["/"].view;
        }

        for(let route in this.routes){
            if(route == '/') continue;
            if(Url.match(route,url)){
                view = this.routes[route].view;
            }
        }
        return view;
    }

    renderSideMenu(){
        return (
            <div className="ui-fluid-height sidemenu ui-hide ui-md-element ui-all-center">
                <div className="ui-container ui-size-fluid user-zone ui-vertical-center">
                    <Button className="ui-element ui-size-fluid toggler"
                        onClick={()=>{
                            this.setState(state => {
                                return {
                                    ...state,
                                    expanded: !state.expanded
                                }
                            })
                        }}
                    >
                        <Icon icon="bars"/>
                    </Button>
                </div>
                {
                    this.list[0].map((key,index)=>{
                        let active = (this.state.route == key && key == '/') || (Url.match(key,this.state.route) && key != '/');
                        return (
                            <Link href={key} key={index} className={
                                "ui-container ui-all-center ui-size-fluid ui-unwrap link ui-nowrap " +
                                (active ? 'active' : '')
                            }>
                                <Icon icon={this.routes[key].icon}/>
                                <div className="ui-element text ui-nowrap ui-text-ellipsis">
                                    {this.routes[key].text}
                                </div>
                            </Link>
                        )
                    })
                }
                <div className="ui-container ui-size-fluid user-zone ui-horizontal-center ui-vertical-bottom">
                    <IconButton>
                        <Avatar square={"30px"} text={Management.data.lastname[0].toUpperCase()}/>
                    </IconButton>
                </div>
            </div>
        );
    }

    renderHeader(){
        return (
            <div className="ui-container ui-size-fluid view-app-bar ui-vertical-center">
                <div className="ui-container ui-size-2 ui-md-size-1 ui-all-center prev">
                    <IconButton>
                        <Icon icon="arrow-left"
                              className={"back-to-prev "+(this.state.back ? '' : 'ui-hide')}
                              onClick={()=>{
                                  Route.back();
                              }}
                        />
                    </IconButton>
                </div>
                <div className="ui-container ui-size-5 title">
                    {Management.getProjectName()}
                </div>
                <div className="ui-container ui-vertical-center ui-unwrap ui-size-5 ui-md-size-6 ui-horizontal-right appbar-icons">
                    <Writing.RenderSelect
                        label="Filiale"
                        variant="outlined"
                        className="ui-element ui-size-4"
                        onChange={(e)=>this.changeBranch(e.target.value)}
                        sx = {{
                            height: 30
                        }}
                        value={this.state.branch}
                        list={this.branches}
                    />
                    <IconButton onClick={(e)=>{
                        this.setState(state=>{
                            return {
                                ...state,
                                userMenu: e.target
                            }
                        })
                    }}>
                        <Avatar square="34px" text={Management.data.lastname[0].toUpperCase()} />
                    </IconButton>
                    <Main.MenuList
                        el={this.state.userMenu}
                        onClose={()=>{
                            this.setState(state=>{
                                return {...state, userMenu: null};
                            })
                        }}
                        list={[
                            {
                                icon: <Icon icon="sign-out-alt"/>,
                                label: "Déconnexion",
                                click: (e)=>{
                                    this.setState(state=>{
                                        return {...state, userMenu: null};
                                    })
                                    this.toggleDialogBox(true)
                                }
                            }
                        ]}
                    />
                    <IconButton>
                        <Icon icon="bell"/>
                    </IconButton>
                    <IconButton>
                        <Icon icon="cog"/>
                    </IconButton>
                </div>
            </div>
        )
    }

    renderBottomNavBar(){
        let route = "/";
        this.list[0].forEach((val)=>{
            route = (this.state.route == val && val == '/') || (Url.match(val,this.state.route) && val != '/') ? val : route;
        });
        return (
            <div className="ui-size-fluid view-bottom-bar ui-absolute ui-bottom-close ui-left-close ui-md-hide">
                <BottomNavigation value={route} showLabels onChange={(ev,value)=>{
                    Route.pushState(value);
                }}>
                    {
                        this.list[1].map((key,index)=>{
                            let active = (this.state.route == key && key == '/') || (Url.match(key,this.state.route) && key != '/');
                            return (
                                <BottomNavigationAction
                                    className="link"
                                    value={key}
                                    label={this.routes[key].text}
                                    icon={<Icon icon={this.routes[key].icon}/>}
                                />
                            )
                        })
                    }
                </BottomNavigation>
            </div>
        )
    }

    render() {
        return (
            <>
                <div className={"ui-container ui-vfluid "+(this.state.expanded ? 'expanded' : '')} id="main-panel">
                    {this.renderSideMenu()}
                    <div className="ui-container ui-fluid-height view-wrapper ui-relative">
                        {this.renderHeader()}
                        <div className="ui-container ui-size-fluid view-body">
                            {this.renderView()}
                        </div>
                        {this.renderBottomNavBar()}
                    </div>
                </div>
                <Main.DialogBox
                    title="Déconnexion"
                    open={this.state.dialogBox.open}
                    content="Vous allez vous déconnecter !"
                    buttons={[
                        <Button variant="text" onClick={()=>{
                            this.toggleDialogBox(false);
                        }}>Annuler</Button>,
                        <Button variant="text" onClick={()=>{
                            this.toggleDialogBox(false);
                            Management.storage.setItem('agent', null).then(()=>{
                                Events.emit('reset-view');
                                Route.pushState('/');
                                Main.socket.close();
                            });
                        }}>Oui</Button>
                    ]}
                />
            </>
        );
    }
}
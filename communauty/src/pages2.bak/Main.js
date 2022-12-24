import React from 'react';
import Grid from "@mui/material/Grid/Grid";
import Button from "@mui/material/Button/Button";
import {
    AppBar,
    Avatar,
    Box, Divider,
    Drawer,
    IconButton,
    List, ListItem, ListItemIcon, ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography
} from "@mui/material";
import {Icon} from "../components/Header";
import Management from "../utils/Management";
import Field from "../components/Field";
import Url from "../utils/Url";
import Link from "../components/Link";

export default class Main extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            openMenu: false,
            route: '/'
        };
        this.target = {
            menu: null
        };
        this.list = [
            ["/","/writing","/studio","/communauty","/messenging"],
            ["/writing","/studio","/","/communauty","/messenging"]
        ];
        this.routes = Management.getRoutes();
    }

    toggleUserMenu(e : null){
        if(e) this.target.menu = e.target;
        this.setState(state => {
            return {
                ...state,
                openMenu: !state.openMenu
            }
        });
    }

    renderHeader(){
        return (
            <AppBar position="fixed" className="view-app-bar">
                <Toolbar>
                    <IconButton>
                        <Icon icon="bars"/>
                    </IconButton>
                    <Typography variant="h6" className="title" sx={{
                        flexGrow: 1
                    }}>
                        {Management.getProjectName()}
                    </Typography>
                    <Field type="search" placeholder="Recherchez quelque chose"/>
                    <Tooltip title="Notification">
                        <IconButton>
                            <Icon icon="bell"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Menu utilisateur">
                        <IconButton onClick={(e)=>{
                            this.toggleUserMenu(e);
                        }}>
                            <Avatar alt="Test"/>
                        </IconButton>
                    </Tooltip>
                    <Menu open={this.state.openMenu} anchorEl={this.target.menu} anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                    }} sx={{
                        mt: '45px'
                    }}>
                        <MenuItem onClick={()=>{
                            this.toggleUserMenu(null);
                        }}>Settings</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
        )
    }

    renderSideMenu(){
        return (
            <Drawer variant="permanent" className="sidemenu" open={true}>
                <Box className="ui-height-2">
                  <IconButton>
                      <Icon icon="arrow-left"/>
                  </IconButton>
                    <Divider/>
                    <List>
                        {
                            this.list[0].map((key,index)=>{
                                let active = (this.state.route == key && key == '/') || (Url.match(key,this.state.route) && key != '/');
                                return (
                                    <Link href={key} key={index} className={
                                        " " +
                                        (active ? 'active' : '')
                                    }>
                                        <ListItem>
                                            <ListItemIcon>
                                                <Icon icon={this.routes[key].icon}/>
                                            </ListItemIcon>
                                            <ListItemText>
                                                {this.routes[key].text}
                                            </ListItemText>
                                        </ListItem>
                                    </Link>
                                )
                            })
                        }
                    </List>
                </Box>
            </Drawer>
        )
    }

    render(){
        return(
            <Grid container className="ui-fluid-vheight" id="main-panel">
                {this.renderHeader()}
                {this.renderSideMenu()}
            </Grid>
        )
    }
}
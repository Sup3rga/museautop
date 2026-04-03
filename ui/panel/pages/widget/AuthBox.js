import Main from "../Main";
import Writing from "../view/Writing";
import {Icon} from "../../components/Header";
import {Box, Button} from "@mui/material";
import {useState} from "react";

export default function AuthBox(props){
    const {
        title=null, open=false, onSubmit=null,
        hint="Votre mot de passe",
        authenticate=true, actionText="Authentifier",
        onAbort=null
    } = props;
    const [state, setState] = useState({
        text: false,
        password: ''
    });
    return (
        <Main.DialogBox
            title={title}
            open={open}
            onClose={()=>{
                setState(state=>{return {...state, password: ''}});
                if(onAbort) {
                    onAbort();
                }
            }}
            content={
                <Box sx={{
                    width: '100%',
                    padding: '.4em'
                }}>
                    <Writing.TextField
                        label={hint}
                        type={state.text ? "text" : "password"}
                        endIcon={
                            <Icon
                                icon={state.text ? "eye-slash" : "eye"}
                                onClick={()=>setState(state =>{
                                    return {...state, text: !state.text}
                                })}
                            />
                        }
                        onChange={(e)=>setState(state =>{
                            return {...state, password: e.target.value}
                        })}
                        value={state.password}
                    />
                </Box>
            }
            buttons={
                <Button
                    startIcon={!authenticate ? null : <Icon icon="lock"/>}
                    onClick={()=>{
                        if(!state.password.length){
                            return;
                        }
                        if(onSubmit){
                            onSubmit(state.password);
                        }
                    }}
                    sx={{textTransform: 'capitalize'}}
                >{actionText}</Button>
            }
        />
    )
}
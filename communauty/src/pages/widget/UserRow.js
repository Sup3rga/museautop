import Link from "../../components/Link";
import Management from "../../utils/Management";
import {Avatar, IconButton} from "@mui/material";
import {Icon} from "../../components/Header";
import {useState} from "react";
import Main from "../Main";


export default function UserRow(props){
    const [el, setEl] = useState(null);
    const {link = null, name, date = null, info = null, read = true, options = [], avatar=null} = props;
    return (
        <>
            <Link href={link}
                  className={"ui-container ui-size-fluid ui-vertical-center ui-unwrap message-row "+(read ? '': 'unread')}
            >
                <Avatar src={avatar} variant="rounded" className="avatar">
                    {name[0].toUpperCase()}
                </Avatar>
                <div className="ui-container data ui-size-fluid">
                    <div className="ui-container ui-size-fluid line ui-unwrap ui-vertical-center">
                        <div className="ui-container ui-size-8 name">
                            {name}
                        </div>
                        <div className="ui-container date ui-size-4">
                            {!date ? null: Management.getDateString(date)}
                        </div>
                    </div>
                    <div className="ui-container ui-size-fluid message">
                        {info}
                    </div>
                </div>
            </Link>
            {
                !options.length ? null :
                    <>
                        <IconButton
                            sx={{position: 'absolute', right: '5px', top: '5px'}}
                            onClick={(e)=>{
                                setEl(e.target);
                            }}
                        >
                            <Icon icon="ellipsis-v"/>
                        </IconButton>
                        <Main.MenuList
                            el={el}
                            onClose={()=>setEl(null)}
                            sx={{mt: '5px', ml: '-10px'}}
                            list={options}
                        />
                    </>
            }
        </>
    )
}
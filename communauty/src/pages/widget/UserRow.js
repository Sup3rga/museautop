import Link from "../../components/Link";
import Management from "../../utils/Management";
import {Avatar} from "@mui/material";
export default function UserRow(props){
    return (
        <Link href={props.link}
              className={"ui-container ui-size-fluid ui-vertical-center ui-unwrap message-row "+(props.read ? '': 'unread')}
        >
            <Avatar variant="rounded" className="avatar">
                {props.name[0].toUpperCase()}
            </Avatar>
            <div className="ui-container data ui-size-fluid ui-md-size-8">
                <div className="ui-container ui-size-fluid line ui-unwrap ui-vertical-center">
                    <div className="ui-container ui-size-8 name">
                        {props.name}
                    </div>
                    <div className="ui-container date ui-size-4">
                        {!props.date ? null: Management.getDateString(props.date)}
                    </div>
                </div>
                <div className="ui-container ui-size-fluid message">
                    {props.info}
                </div>
            </div>
        </Link>
    )
}
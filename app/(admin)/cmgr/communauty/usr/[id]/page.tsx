import Home from "@/ui/panel/pages/Home";
import UserInfo from "@/ui/panel/pages/view/UserInfo";

export default async function Page({params} : any){
    // const {id} = await params;
    return (
        <Home>
            <UserInfo/>
        </Home>
    )
}
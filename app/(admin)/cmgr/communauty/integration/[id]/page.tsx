import Manager from "@/server/data/Manager";
import Home from "@/ui/panel/pages/Home";
import Integration from "@/ui/panel/pages/view/Integration";

export default async function Page({params} : any){
    const {id} = await params;
    const man = await Manager.fetchById(id);
    console.log("FETCH>>>",{id, man})
    return (
        <Home>
            <Integration manager={man ? JSON.stringify(man) : null}/>
        </Home>
    )
}
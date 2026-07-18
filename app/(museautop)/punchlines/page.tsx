import Wayto from "@/server/controller/wayto";
import Punchlines from "@/ui/site/pages/punchlines";

export default async function Page(){
    const {data} = await Wayto.getPunchlinesPageData();
    console.log('[PUNCHLINES.]', data);
    return <Punchlines {...data}/>
}
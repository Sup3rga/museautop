import type { Metadata } from 'next';
import Wayto from "@/server/controller/wayto";
import Punchlines from "@/ui/site/pages/punchlines";

export const metadata : Metadata = {
    title: "Punchlines",
    description: "Retrouvez toutes les cartes de punchlines qui pourrait vous interesser"
}
export default async function Page(){
    const {data} = await Wayto.getPunchlinesPageData();
    console.log('[PUNCHLINES.]', data);
    return <Punchlines {...data}/>
}
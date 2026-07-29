import Wayto from "@/server/controller/wayto";
import Oups from "@/ui/site/pages/oups";
import PunchlineView from "@/ui/site/pages/punchline-view";
import {Props} from "@/app/types"

async function extractData(params : Promise<Record<any, any>>){
    const {slug} = await params;
    console.log('[SLUG]', slug);
    return await Wayto.getPunchline(slug);
}
export async function generateMetadata({params} : Props){
    const request = await  extractData(params);
    if(request.error) return {};
    const {punchline} = request.data;
    return {
        title: punchline.title,
        description: punchline.comment,
        openGraph:{
            title: punchline.title,
            description: punchline.comment,
            sitename: punchline.title + " - Musautop",
            url: "/punchlines/"+punchline.id,
            images:[
                {
                    url: punchline.card,
                    height: 200,
                    width: 400
                }
            ]
        }
    };
}
export default async function Page({params} : any){
    const request = await extractData(params);
    if(request.error) return <Oups/>;
    // console.log('[Data]', request);
    return <PunchlineView {...request.data}/>;
}
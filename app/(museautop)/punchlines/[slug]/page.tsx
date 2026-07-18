import Wayto from "@/server/controller/wayto";
import Reading from "@/ui/site/pages/reading";
import Oups from "@/ui/site/pages/oups";
import PunchlineView from "@/ui/site/pages/punchline-view";

export default async function Page({params} : any){
    const {slug} = await params;
    // console.log("[Slug]", slug);
    const request = await Wayto.getPunchline(slug);
    if(request.error) return <Oups/>;
    // console.log('[Data]', request);
    return <PunchlineView {...request.data}/>;
}
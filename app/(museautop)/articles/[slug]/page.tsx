import Wayto from "@/server/controller/wayto";
import Reading from "@/ui/site/pages/reading";
import Oups from "@/ui/site/pages/oups";

export default async function Page({params} : any){
    const {slug} = await params;
    const request = await Wayto.getReadingPageData(slug);
    if(request.error) return <Oups/>;
    console.log('[Data]', request.data);
    return <Reading {...request.data}/>;
}
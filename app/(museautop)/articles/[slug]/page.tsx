import Wayto from "@/server/controller/wayto";
import Reading from "@/ui/site/pages/reading";
import Oups from "@/ui/site/pages/oups";
import {Props} from "@/app/types";


async function extractData(params : Promise<Record<any, any>>){
    const {slug} = await params;
    return await Wayto.getReadingPageData(slug);
}
export async function generateMetadata({params} : Props){
    const request = await  extractData(params);
    if(request.error) return {};
    const {article} = request.data;
    return {
        title: article.title,
        description: article.resume,
        openGraph:{
            title: article.title,
            description: article.resume,
            sitename: article.title + " - Musautop",
            url: "/articles/"+article.slug,
            images:[
                {
                    url: article.caption,
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
    return <Reading {...request.data}/>;
}
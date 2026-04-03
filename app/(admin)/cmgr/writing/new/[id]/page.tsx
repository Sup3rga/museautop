import Home from "@/ui/panel/pages/Home";
import Redactor from "@/ui/panel/pages/view/Redactor";
import Articles from "@/server/data/Articles";

export default async function Page({params} : any){
    const id = (await params).id;
    const isDraft = /^dft-[0-9]+$/.test(id);
    const article = isDraft ? null : await Articles.getById(id);
    // console.log('[ID]',id, article);
    return (
        <Home>
            <Redactor draft={isDraft ? id : null} article={isDraft ? null : JSON.stringify(article)}/>
        </Home>
    );
}
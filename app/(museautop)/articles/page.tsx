import Wayto from "@/server/controller/wayto";
import ArticlesPage from "@/ui/site/pages/articles";
import type {Metadata} from "next";

export const metadata : Metadata = {
    title: "Articles",
    description: "Retrouvez les actualités de la culture musicale ici, chez nous et bien mieux qu'ailleurs !"
}
export default async function Page(){
    const {data} = await Wayto.getArticlesPageData();
    return <ArticlesPage {...data}/>
}
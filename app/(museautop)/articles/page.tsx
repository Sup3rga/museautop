import Wayto from "@/server/controller/wayto";
import ArticlesPage from "@/ui/site/pages/articles";

export default async function Page(){
    const {data} = await Wayto.getArticlesPageData();
    return <ArticlesPage {...data}/>
}
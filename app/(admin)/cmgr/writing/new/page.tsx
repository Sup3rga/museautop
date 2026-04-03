import Home from "@/ui/panel/pages/Home";
import Redactor from "@/ui/panel/pages/view/Redactor";
import Articles from "@/server/data/Articles";

export default async function Page(){
    return (
        <Home>
            <Redactor/>
        </Home>
    );
}
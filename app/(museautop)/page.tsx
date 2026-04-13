import Home from "@/ui/site/pages/home";
import Ressources from "@/ui/utils/Ressources";
import Wayto from "@/server/controller/wayto";

export default async function HomePage() {
  const {data} = await Wayto.getHomeSummary()
  return <Home {...data}/>;
}

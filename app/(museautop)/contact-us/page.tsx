import ContactUs from "@/ui/site/pages/contact";
import type {Metadata} from "next";

export const metadata : Metadata = {
    title: "Contactez-nous",
    description: "Nous sommes intéressés par vous et vos idées."
}
export default function Page(){
    return <ContactUs/>
}
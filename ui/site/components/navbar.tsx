"use client";
import {visites} from "@/app/(museautop)/actions";

import Ressources from "@/ui/utils/Ressources";
import {usePathname} from "next/navigation";
import {useEffect} from "react";
import Link from "next/link";

interface _LinkInfo {
    href: string
    label: string
    ascendant?: boolean
}

const links : _LinkInfo[] = [
    {
        href: "/",
        label: "Accueil",
    },
    {
        href: "/articles",
        label: "Articles",
        ascendant: true
    },
    {
        href: "/punchlines",
        label: "Punchlines",
        ascendant: true
    },
    {
        href: "/contact-us",
        label: "Contactez-nous",
    }
];
export default function NavBar(){
    const pathname = usePathname();
    useEffect(() => {
        console.log('[Path]',pathname)
        visites().then((e)=>console.log('[FUnc]',e)).catch((err)=>console.log('[Err]',err));
    }, []);
    return (
        <nav>
            <Link className="nav-logo flex items-center" href="/">
                {/*<span>●</span>*/}
                <div className="ui-element navbar-logo ui-size-4 ui-image"/>
                {Ressources.getProjectName()}
            </Link>
            <ul className="nav-links hidden lg:flex">
                {links.map((link: _LinkInfo, key)=>(
                    <li key={key}>
                        <Link href={link.href} className={(!link.ascendant && link.href == pathname) || (link.ascendant && pathname.startsWith(link.href)) ? "active" : ""}>
                            {link.label}
                        </Link>
                    </li>
              ))}
            </ul>
            <div className="nav-right hidden!">
                <div className="nav-search">⌕</div>
            </div>
        </nav>
    )
}
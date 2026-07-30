"use client";
import {visites} from "@/app/(museautop)/actions";

import Ressources from "@/ui/utils/Ressources";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useEffect(() => {
        // console.log('[Path]',pathname)
        visites().then((e)=>console.log('[FUnc]',e)).catch((err)=>console.log('[Err]',err));
    }, []);
    return (
        <div className={"nav-header z-99"}>
            <nav className={`px-4! lg:px-[48px]! z-99 ${isMenuOpen ? "border-b-0! border-b-transparent!" : ""}`}>
                <Link className="nav-logo flex gap-3 items-center" href="/">
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
                <button
                    aria-label="open-menu-mobile"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden relative z-99 w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-300"
                >
                    <div className="relative! w-10 h-10 flex items-center justify-center cursor-pointer">
                        <span
                            className={`absolute left-1 w-8 h-1 bg-gray-800 rounded-full transition-all duration-500 ease-in-out ${
                                isMenuOpen ? "top-1/2 rotate-45" : "-translate-y-2"
                            }`}
                        />
                        <span
                            className={`absolute left-1 w-8 h-1 bg-gray-800 rounded-full transition-all duration-500 ease-in-out ${
                                isMenuOpen ? "opacity-0" : ""
                            }`}
                        />
                        <span
                            className={`absolute left-1 w-8 h-1 bg-gray-800 rounded-full transition-all duration-500 ease-in-out ${
                                isMenuOpen ? "top-1/2 -rotate-45" : "translate-y-2"
                            }`}
                        />
                    </div>
                </button>
            </nav>
            <div
                className={`md:hidden mobile-nav max-h-96 -z-2! absolute left-0 right-0 mt-2 transition-all duration-300 overflow-hidden ${
                    isMenuOpen ? " opacity-100 translate-y-0" : "-translate-y-full opacity-0"
                }`}
            >
                <div className="rounded-bottom-5 bg-[var(--paper)] border border-gray-200 shadow-2xl p-4">
                    <div className="space-y-2">
                        {links.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                // className={(!link.ascendant && link.href == pathname) || (link.ascendant && pathname.startsWith(link.href)) ? "active" : ""}
                                className="block text-gray-900 hover:text-primary transition-colors duration-300 font-medium py-3! px-4! text-lg border-gray-200 last:border-b-0"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
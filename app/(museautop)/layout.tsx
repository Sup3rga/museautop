import type { Metadata } from "next";
import Ressources from "@/ui/utils/Ressources";
import NavBar from "@/ui/site/components/navbar";
import Link from "next/link";
import {AnimatePresence} from "framer-motion";
import "@/styles/site.css"
import Cookie from "@/server/data/Cookie";
import {cookies} from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  Cookie.setProvider(await cookies(), Cookie.processModes.NEXT);
  return (
      <>
        <NavBar/>
        <AnimatePresence mode={"wait"}>
            {children}
        </AnimatePresence>
        <footer>
          <div className="footer-logo"><span>●</span> {Ressources.getProjectName()}</div>
          <p className="footer-copy">© 2025 {Ressources.getProjectName()} — Tous droits réservés</p>
          <ul className="footer-nav">
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/articles">Articles</Link></li>
            <li><Link href="/contact-us">Punchlines</Link></li>
          </ul>
        </footer>
      </>
  );
}

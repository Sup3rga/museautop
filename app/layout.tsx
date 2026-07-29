import type { Metadata } from "next";
import "@/styles/style.css";
import "@/styles/fonts.css";
import "@/styles/web.css";
import "@/styles/ui.css";
import "@/styles/line-awesome-1.3.0/css/line-awesome.css";
import "./globals.css";
import { Noto_Sans, Playfair_Display } from "next/font/google";
import { cn } from "@/lib/utils";

const playfairDisplayHeading = Playfair_Display({subsets:['latin'],variable:'--font-heading'});

const notoSans = Noto_Sans({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
    title: {
        template: "%s - Museautop",
        default: "Museautop"
    },
    icons:{
        icon: "/assets/logo.jpg"
    },
    description: "Tout ce qu'il vous faut sur l'actualité",
    metadataBase: new URL('https://museautop.com'),
    alternates: { canonical: '/' },
    openGraph:{
        title: "Museautop",
        description: "Tout ce qu'il vous faut sur l'actualité",
        sitename: "Museautop",
        url: "https://museautop.com",
        images:[
            {
                url: "/assets/logo.png",
                height: 100,
                width: 100
            }
        ]
    }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", notoSans.variable, playfairDisplayHeading.variable)}>
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

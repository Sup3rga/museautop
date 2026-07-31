import Articles from "@/server/data/Articles";
import Punchlines from "@/server/data/Punchlines";
import {MetadataRoute} from "next";

const baseUrl = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://musautop.com";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Pages statiques
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/punchlines`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact-us`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
    ]

    // Pages dynamiques : articles
    const articles : any[] = await Articles.fetchAll(1,true, false,false);
    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: article.modifiedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));
    //
    // // Pages dynamiques : cartes de parole
    const cartes : any[] = await Punchlines.fetchAll(1, true, false, false, true);
    const cartePages: MetadataRoute.Sitemap = cartes.map((carte) => ({
        url: `${baseUrl}/punchlines/${carte.slug}`,
        lastModified: carte.modifiedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
    }))

    return [...staticPages, ...articlePages, ...cartePages]
}
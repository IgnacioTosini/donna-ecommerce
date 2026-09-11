import type { Metadata } from 'next';
import { HomeContentView } from '@/components/sections/HomeContentView';
import { getPublishedContent } from '@/lib/site-content';

export async function generateMetadata(): Promise<Metadata> {
    const { business } = await getPublishedContent();
    const title = `${business.name} | ${business.category}`;
    return {
        title: { absolute: title }, description: business.footerDescription,
        alternates: { canonical: '/' },
        openGraph: { title, description: business.footerDescription, url: '/' },
        twitter: { title, description: business.footerDescription },
    };
}

export default async function Home() {
    const { home } = await getPublishedContent();
    return <main><HomeContentView content={home} /></main>;
}

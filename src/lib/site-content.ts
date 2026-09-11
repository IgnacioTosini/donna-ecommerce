import 'server-only';
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import { businessSchema, homeSchema, defaultBusiness, defaultHome, type ContentKey } from './site-content-schema';
import { isAdminAuthenticated } from './admin-session';

export const CONTENT_CACHE_TAG = 'site-content';
export const getPublishedContent = unstable_cache(async () => {
    const records = await prisma.siteContent.findMany();
    return {
        business: businessSchema.parse(records.find(r => r.id === 'business')?.published ?? defaultBusiness),
        home: homeSchema.parse(records.find(r => r.id === 'home')?.published ?? defaultHome),
    };
}, ['site-content-v1'], { revalidate: false, tags: [CONTENT_CACHE_TAG] });

export async function requireContentAdmin() {
    if (!await isAdminAuthenticated()) throw new Error('No autorizado');
}

export async function getContentEditor(key: ContentKey) {
    await requireContentAdmin();
    const defaults = key === 'home' ? defaultHome : defaultBusiness;
    const record = await prisma.siteContent.upsert({
        where: { id: key }, update: {},
        create: { id: key, draft: defaults, published: defaults },
    });
    return { draft: record.draft, version: record.version,
        publishedAt: record.publishedAt?.toISOString() ?? null,
        hasDraft: JSON.stringify(record.draft) !== JSON.stringify(record.published) };
}

export async function getPreviewContent() {
    await requireContentAdmin();
    const records = await prisma.siteContent.findMany();
    return {
        home: homeSchema.parse(records.find(r => r.id === 'home')?.draft ?? defaultHome),
        business: businessSchema.parse(records.find(r => r.id === 'business')?.draft ?? defaultBusiness),
    };
}

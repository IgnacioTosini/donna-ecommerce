'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireContentAdmin, CONTENT_CACHE_TAG } from '@/lib/site-content';
import { businessSchema, homeSchema } from '@/lib/site-content-schema';
import { revalidatePath, updateTag } from 'next/cache';

const inputSchema = z.object({ key: z.enum(['home', 'business']), version: z.number().int().nonnegative() });
const conflict = 'Hay una versión más reciente. Recargá la página antes de continuar.';

export async function saveContentDraft(input: unknown, draft: unknown) {
    await requireContentAdmin();
    const { key, version } = inputSchema.parse(input);
    const parsed = (key === 'home' ? homeSchema : businessSchema).safeParse(draft);
    if (!parsed.success) return { ok: false as const, message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n') };
    const result = await prisma.siteContent.updateMany({ where: { id: key, version },
        data: { draft: parsed.data, version: { increment: 1 } } });
    if (!result.count) return { ok: false as const, message: conflict };
    return { ok: true as const, version: version + 1 };
}

export async function publishContent(input: unknown) {
    await requireContentAdmin();
    const { key, version } = inputSchema.parse(input);
    const record = await prisma.siteContent.findUnique({ where: { id: key } });
    if (!record || record.version !== version) return { ok: false as const, message: conflict };
    const published = (key === 'home' ? homeSchema : businessSchema).parse(record.draft);
    const publishedAt = new Date();
    const result = await prisma.siteContent.updateMany({ where: { id: key, version },
        data: { published, publishedAt, version: { increment: 1 } } });
    if (!result.count) return { ok: false as const, message: conflict };
    updateTag(CONTENT_CACHE_TAG);
    revalidatePath('/', 'layout');
    return { ok: true as const, version: version + 1, publishedAt: publishedAt.toISOString() };
}

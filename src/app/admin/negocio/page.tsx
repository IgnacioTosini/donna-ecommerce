import { getContentEditor } from '@/lib/site-content';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export const metadata = { title: 'Datos del negocio' };
export default async function Page() {
    return <ContentEditor contentKey="business" initial={await getContentEditor('business')} />;
}

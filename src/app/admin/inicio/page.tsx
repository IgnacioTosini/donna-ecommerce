import { getContentEditor } from '@/lib/site-content';
import { ContentEditor } from '@/components/admin/content/ContentEditor';

export const metadata = { title: 'Página de inicio' };
export default async function Page() {
    return <ContentEditor contentKey="home" initial={await getContentEditor('home')} />;
}

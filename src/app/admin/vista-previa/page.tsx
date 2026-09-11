import Link from 'next/link';
import { getPreviewContent } from '@/lib/site-content';
import { BusinessProvider } from '@/components/layout/BusinessProvider';
import { HomeContentView } from '@/components/sections/HomeContentView';
import Navbar from '@/components/layout/Navbar/Navbar';
import Footer from '@/components/layout/Footer/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer/CartDrawer';
import '@/components/admin/content/content-editor.scss';

export const metadata = { title: 'Vista previa del borrador', robots: { index: false, follow: false } };
export default async function Page() {
    const { business, home } = await getPreviewContent();
    return <div className="content-preview">
        <div className="content-preview-notice">Vista previa de los borradores guardados · Los enlaces llevan a la tienda publicada.
            <Link href="/admin/inicio">Volver al editor</Link>
        </div>
        <BusinessProvider business={business} preview>
            <Navbar />
            <HomeContentView content={home} />
            <Footer />
            <CartDrawer />
        </BusinessProvider>
    </div>;
}

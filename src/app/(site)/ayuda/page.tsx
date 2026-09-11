import { getPublishedContent } from '@/lib/site-content';
import { FiArrowUpRight, FiClock, FiInstagram, FiMapPin, FiPackage, FiRefreshCw, FiTruck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import '@/components/productPage/shopping-help.scss';

export const metadata = { title: 'Cambios y entregas', description: 'Información para coordinar la entrega o consultar un cambio.', alternates: { canonical: '/ayuda' } };
export default async function Page() {
    const { business } = await getPublishedContent();
    const whatsappNumber = business.whatsapp.replace(/\D/g, '');

    return <main className="shopping-policies">
        <header className="shopping-policies-hero">
            <span>Información de compra</span>
            <h1>Cambios y entregas</h1>
            <p>Todo lo que necesitás saber antes y después de hacer tu pedido.</p>
        </header>

        <div className="shopping-policies-grid">
            <section className="shopping-policy-card">
                <div className="shopping-policy-icon"><FiTruck /></div>
                <span className="shopping-policy-number">01</span>
                <h2>Entregas</h2>
                <p>{business.deliveryPolicy}</p>
            </section>
            <section className="shopping-policy-card">
                <div className="shopping-policy-icon"><FiRefreshCw /></div>
                <span className="shopping-policy-number">02</span>
                <h2>Cambios</h2>
                <p>{business.exchangePolicy}</p>
            </section>
            <section className="shopping-policy-card">
                <div className="shopping-policy-icon"><FiPackage /></div>
                <span className="shopping-policy-number">03</span>
                <h2>Confirmación del pedido</h2>
                <p>Enviar una solicitud por WhatsApp no reserva stock. Te confirmaremos disponibilidad y condiciones antes de completar la compra.</p>
            </section>
        </div>

        <section className="shopping-contact">
            <div className="shopping-contact-heading">
                <span>¿Necesitás ayuda?</span>
                <h2>Contactanos</h2>
                <p>Escribinos y te ayudamos a resolver tu consulta.</p>
            </div>
            <div className="shopping-contact-details">
                <p><FiMapPin /><span>{business.address}<br />{business.locality}</span></p>
                <p><FiClock /><span>{business.openingDays}<br />{business.openingHours}</span></p>
            </div>
            <div className="shopping-contact-actions">
                {whatsappNumber && <a className="shopping-contact-whatsapp" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> Consultar por WhatsApp <FiArrowUpRight /></a>}
                <a href={`https://www.instagram.com/${business.instagramUsername}/`} target="_blank" rel="noopener noreferrer"><FiInstagram /> @{business.instagramUsername} <FiArrowUpRight /></a>
            </div>
        </section>
    </main>;
}

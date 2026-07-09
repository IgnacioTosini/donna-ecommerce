"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateFooter } from '@/components/animations/gsap/sectionAnimations';
import { IoLogoInstagram, IoLogoWhatsapp } from 'react-icons/io';
import { navigationItems } from '@/utils/navigationItems';
import { handleSectionNavigation } from '@/utils/navigationHelpers';
import './_footer.scss';

const paymentMethods = [
  { name: 'Visa' },
  { name: 'Mastercard' },
  { name: 'American Express' },
  { name: 'PayPal' },
  { name: 'Efectivo' },
];

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      animateFooter(footerRef.current!);
    }, footerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="footer">
      <div className='footerValueStrip'>
        <p>Envios a todo el pais</p>
        <p>3 y 6 cuotas sin interes</p>
        <p>Cambios simples dentro de 30 dias</p>
      </div>
      <div className='footerContent'>
        <div className='footerContentHeader'>
          <h1>Tienda Demo</h1>
          <p className='footerContentHeaderDescription'>Moda de muestra para quienes buscan una experiencia de compra simple, clara y lista para adaptar a cualquier marca.</p>
          <div className='footerContentHeaderSocialMedia'>
            <Link href='https://www.instagram.com/example/' target='_blank' rel='noopener noreferrer'>
              <IoLogoInstagram size={24} />
            </Link>
            <Link href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target='_blank' rel='noopener noreferrer'>
              <IoLogoWhatsapp size={24} />
            </Link>
          </div>
        </div>
        <div className='footerContentNavigationColumn'>
          <h2 className='footerContentNavigationTitle'>Tienda</h2>
          <ul className='footerContentNavigation'>
            {
              navigationItems.map(item => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={(event) => {
                      if (!item.sectionId) return;
                      handleSectionNavigation({
                        event,
                        pathname,
                        sectionId: item.sectionId,
                      });
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))
            }
          </ul>
        </div>
        <div className='footerContentPaymentColumn'>
          <h2 className='footerContentPaymentTitle'>Pago seguro:</h2>
          <ul className='footerContentPayment'>
            {
              paymentMethods.map(method => (
                <li key={method.name} className='footerContentPaymentItem'>{method.name}</li>
              ))
            }
          </ul>
        </div>
      </div>
      <div className='footerContentFooter'>
        <div className='footerContentInfo'>
          <h4>© {new Date().getFullYear()} Tienda Demo. Todos los derechos reservados.</h4>
          <p>Creado por Ignacio Tosini</p>
        </div>
      </div>
    </footer>
  )
}

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { animateFooter } from '@/components/animations/gsap/sectionAnimations';
import { IoLogoInstagram, IoLogoWhatsapp } from 'react-icons/io';
import { navigationItems } from '@/utils/navigationItems';
import { handleSectionNavigation } from '@/utils/navigationHelpers';
import { useBusiness } from '@/components/layout/BusinessProvider';
import './_footer.scss';

export default function Footer() {
  const { business: storefront } = useBusiness();
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
        <p>{storefront.shipping}</p>
        <p>{storefront.installments}</p>
        <p>Seguinos en @{storefront.instagramUsername}</p>
      </div>
      <div className='footerContent'>
        <div className='footerContentHeader'>
          <h1>{storefront.name}</h1>
          <p className='footerContentHeaderDescription'>{storefront.footerDescription}</p>
          <div className='footerContentHeaderSocialMedia'>
            <Link href={`https://www.instagram.com/${storefront.instagramUsername}/`} target='_blank' rel='noopener noreferrer' aria-label={`Instagram de ${storefront.name}`}>
              <IoLogoInstagram size={24} />
            </Link>
            {storefront.whatsapp && <Link href={`https://wa.me/${storefront.whatsapp}`} target='_blank' rel='noopener noreferrer' aria-label={`WhatsApp de ${storefront.name}`}>
              <IoLogoWhatsapp size={24} />
            </Link>}
          </div>
        </div>
        <div className='footerContentNavigationColumn'>
          <h2 className='footerContentNavigationTitle'>Tienda</h2>
          <ul className='footerContentNavigation'>
            <li><Link href="/ayuda">Cambios y entregas</Link></li>
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
          <h2 className='footerContentPaymentTitle'>Nuestro local</h2>
          <ul className='footerContentPayment'>
            <li className='footerContentPaymentItem'>{storefront.address}</li>
            <li className='footerContentPaymentItem'>{storefront.locality}</li>
            <li className='footerContentPaymentItem'>{storefront.openingDays}</li>
            <li className='footerContentPaymentItem'>{storefront.openingHours}</li>
          </ul>
        </div>
      </div>
      <div className='footerContentFooter'>
        <div className='footerContentInfo'>
          <h4>© {new Date().getFullYear()} {storefront.name}. Todos los derechos reservados.</h4>
          <p>Creado por Ignacio Tosini</p>
        </div>
      </div>
    </footer>
  )
}

'use client';

import { Banner } from '@/types';
import { BannerModal } from '../bannerModal/BannerModal'
import { useBannerModalStore } from '@/store/banner.store';
import { BannersTable } from '../bannersTable/BannersTable';
import './_bannerSection.scss'

interface Props {
    banners: Banner[];
}

export const BannerSection = ({ banners }: Props) => {
    const isOpenBanner = useBannerModalStore((state) => state.isOpen);
    const closeBanner = useBannerModalStore((state) => state.close);
    const openCreateBanner = useBannerModalStore((state) => state.openCreate);
    
    return (
        <>
            <div className="banners-header">
                <div className="banners-header-text">
                    <h1 className="banners-title">Banners</h1>
                    <p className="banners-description">{banners.length} {banners.length === 1 ? 'banner disponible' : 'banners disponibles'}</p>
                </div>
                <button className="banners-button" onClick={openCreateBanner}>+ Nuevo Banner</button>
            </div>
            <BannerModal isOpen={isOpenBanner} onClose={closeBanner} />
            <BannersTable banners={banners} />
        </>
    )
}

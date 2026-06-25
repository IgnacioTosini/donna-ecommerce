'use client';

import { IoMdClose } from 'react-icons/io';
import { useBannerModalStore } from '@/store/banner.store';
import BannerForm from '../bannerForm/BannerForm';
import './_bannerModal.scss';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const BannerModal = ({ isOpen, onClose }: Props) => {
    const editingBanner = useBannerModalStore((state) => state.editingBanner);

    if (!isOpen) return null;
    return (
        <div className="banner-modal-container">
            <div className="banner-modal">
                <div className="banner-modal-header">
                    <h2 className="banner-modal-title">{editingBanner ? `Editar banner` : `Nuevo banner`}</h2>
                    <IoMdClose className="banner-modal-close" onClick={onClose} />
                </div>
                <BannerForm />
            </div>
        </div>
    )
}

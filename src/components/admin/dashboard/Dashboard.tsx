'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IoMdAppstore } from 'react-icons/io';
import { MdCategory, MdOutlineDashboard, MdOutlineImage, MdOutlineShoppingCart, MdProductionQuantityLimits } from "react-icons/md";
import './_dashboard.scss';

export const Dashboard = () => {
    const [isOpen, setIsOpen] = useState(false);
    const closeMenu = () => setIsOpen(false);
    return (
        <>
            {isOpen && (
                <div
                    className="dashboard-overlay"
                    onClick={closeMenu}
                />
            )}

            <button
                className="dashboard-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                ☰
            </button>
            <div className={`dashboard ${isOpen ? 'open' : ''}`}>
                <div className="dashboard-header">
                    <h1 className="dashboard-title">Donna</h1>
                    <p className="dashboard-subtitle">Panel de administración</p>
                </div>

                <div className="dashboard-links">
                    <Link href="/admin" className="dashboard-link" onClick={closeMenu}><MdOutlineDashboard />Dashboard</Link>
                    <Link href="/admin/categorias" className="dashboard-link" onClick={closeMenu}><MdCategory />Categorías</Link>
                    <Link href="/admin/productos" className="dashboard-link" onClick={closeMenu}><MdProductionQuantityLimits />Productos</Link>
                    <Link href="/admin/pedidos" className="dashboard-link" onClick={closeMenu}><MdOutlineShoppingCart />Pedidos</Link>
                    <Link href="/admin/banners" className="dashboard-link" onClick={closeMenu}><MdOutlineImage />Banners</Link>
                </div>

                <div className="dashboard-footer">
                    <Link href="/" className="dashboard-link"><IoMdAppstore />Ver Tienda</Link>
                </div>
            </div>
        </>
    )
}

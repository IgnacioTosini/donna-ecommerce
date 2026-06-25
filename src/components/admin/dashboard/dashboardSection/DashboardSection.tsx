import { DashboardItem } from '../dashboardItem/DashboardItem';
import { BsBox2 } from "react-icons/bs";
import { FaRegFolderOpen } from 'react-icons/fa';
import { IoCartOutline } from "react-icons/io5";
import { CiMoneyBill } from 'react-icons/ci';
import { getProducts } from '@/app/actions/product.action';
import { getCategories } from '@/app/actions/category.action';
import { getAllOrders } from '@/app/actions/utils/orders';
import { DashboardRecentOrders } from '../dashboardRecentOrders/DashboardRecentOrders';
import { DashboardSummary } from '../dashboardSummary/DashboardSummary';
import { OrderWithItems, ProductWithRelations } from '@/types';
import './_dashboardSection.scss';

export const DashboardSection = async () => {
    const [orders, categories, products] = await Promise.all([
        getAllOrders(),
        getCategories(),
        getProducts(),
    ]) as [OrderWithItems[], Awaited<ReturnType<typeof getCategories>>, ProductWithRelations[]];
    const productsCount = products.length;
    const categoriesCount = categories.length;
    const ordersCount = orders.length;
    const revenueCount = orders.reduce((total, order) => total + Number(order.total), 0);

    return (
        <div className="dashboard-section">
            <div className="dashboard-section-header">
                <h1 className="dashboard-section-title">Dashboard</h1>
                <p className="dashboard-section-description">Bienvenido al panel de administración de Donna.</p>
            </div>
            <div className="dashboard-items">
                <DashboardItem title="Productos" count={productsCount} icon={<BsBox2 className="dashboard-item-icon" />} href="/admin/productos" />
                <DashboardItem title="Categorías" count={categoriesCount} icon={<FaRegFolderOpen className="dashboard-item-icon" />} href="/admin/categorias" />
                <DashboardItem title="Pedidos" count={ordersCount} icon={<IoCartOutline className="dashboard-item-icon" />} href="/admin/pedidos" />
                <DashboardItem title="Ingresos ($)" count={revenueCount} icon={<CiMoneyBill className="dashboard-item-icon" />} />
            </div>

            <div className="dashboard-section-footer">
                <DashboardRecentOrders orders={orders} />
                <DashboardSummary orders={orders} products={products} />
            </div>
        </div>
    )
}

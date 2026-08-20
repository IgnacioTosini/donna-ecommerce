import { DashboardItem } from '../dashboardItem/DashboardItem';
import { BsBox2 } from "react-icons/bs";
import { FaRegFolderOpen } from 'react-icons/fa';
import { IoCartOutline } from "react-icons/io5";
import { CiMoneyBill } from 'react-icons/ci';
import { getDashboardData } from '@/app/actions/utils/orders';
import { DashboardRecentOrders } from '../dashboardRecentOrders/DashboardRecentOrders';
import { DashboardSummary } from '../dashboardSummary/DashboardSummary';
import './_dashboardSection.scss';

export const DashboardSection = async () => {
    const dashboard = await getDashboardData();

    return (
        <div className="dashboard-section">
            <div className="dashboard-section-header">
                <h1 className="dashboard-section-title">Dashboard</h1>
                <p className="dashboard-section-description">Bienvenido al panel de administración de Tienda Demo.</p>
            </div>
            <div className="dashboard-items">
                <DashboardItem title="Productos" count={dashboard.productsCount} icon={<BsBox2 className="dashboard-item-icon" />} href="/admin/productos" />
                <DashboardItem title="Categorías" count={dashboard.categoriesCount} icon={<FaRegFolderOpen className="dashboard-item-icon" />} href="/admin/categorias" />
                <DashboardItem title="Pedidos" count={dashboard.ordersCount} icon={<IoCartOutline className="dashboard-item-icon" />} href="/admin/pedidos" />
                <DashboardItem title="Ingresos ($)" count={dashboard.totalRevenue} icon={<CiMoneyBill className="dashboard-item-icon" />} />
            </div>

            <div className="dashboard-section-footer">
                <DashboardRecentOrders orders={dashboard.recentOrders} />
                <DashboardSummary
                    pendingOrders={dashboard.pendingOrdersCount}
                    outOfStockProducts={dashboard.outOfStockProductsCount}
                    saleProducts={dashboard.saleProductsCount}
                    averageTicket={dashboard.averageTicket}
                />
            </div>
        </div>
    )
}

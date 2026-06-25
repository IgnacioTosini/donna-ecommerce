import Link from "next/link";
import { OrderStatus, OrderWithItems } from "@/types";
import "./_dashboardRecentOrders.scss";

type Props = {
    orders: OrderWithItems[];
};

const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
    }).format(value);

export const DashboardRecentOrders = ({ orders }: Props) => {
    const recentOrders = orders.slice(0, 4);

    return (
        <section className="dashboard-recent-orders">
            <h2>Pedidos recientes</h2>

            {recentOrders.length > 0 ? (
                <ul>
                    {recentOrders.map((order) => (
                        <li key={order.id}>
                            <div className="dashboard-recent-order-info">
                                <Link href="/admin/pedidos">ORD-{order.id.slice(0, 4).toUpperCase()}</Link>
                                <span>{order.customerName}</span>
                            </div>

                            <div className="dashboard-recent-order-total">
                                <strong>{formatCurrency(order.total)}</strong>
                                <span>{statusLabels[order.status]}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="dashboard-recent-orders-empty">No hay pedidos recientes.</p>
            )}
        </section>
    );
};

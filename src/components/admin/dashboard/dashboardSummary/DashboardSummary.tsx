import { OrderWithItems, ProductWithRelations } from "@/types";
import "./_dashboardSummary.scss";

type Props = {
    orders: OrderWithItems[];
    products: ProductWithRelations[];
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
    }).format(value);

const getProductStock = (product: ProductWithRelations) =>
    product.variants.reduce((productTotal, variant) => {
        const variantTotal = variant.sizes.reduce(
            (sizeTotal, size) => sizeTotal + size.stock,
            0
        );

        return productTotal + variantTotal;
    }, 0);

export const DashboardSummary = ({ orders, products }: Props) => {
    const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
    const outOfStockProducts = products.filter((product) => getProductStock(product) <= 0).length;
    const saleProducts = products.filter(
        (product) => product.compareAtPrice && product.compareAtPrice > product.price
    ).length;
    const totalRevenue = orders.reduce((total, order) => total + Number(order.total), 0);
    const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

    const items = [
        {
            label: "Pedidos pendientes",
            value: pendingOrders,
        },
        {
            label: "Productos sin stock",
            value: outOfStockProducts,
        },
        {
            label: "Productos en rebajas",
            value: saleProducts,
        },
        {
            label: "Ticket medio",
            value: formatCurrency(averageTicket),
        },
    ];

    return (
        <section className="dashboard-summary">
            <h2>Resumen</h2>

            <dl>
                {items.map((item) => (
                    <div key={item.label}>
                        <dt>{item.label}</dt>
                        <dd>{item.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};

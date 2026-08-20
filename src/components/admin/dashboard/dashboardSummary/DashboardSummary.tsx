import "./_dashboardSummary.scss";

type Props = {
    pendingOrders: number;
    outOfStockProducts: number;
    saleProducts: number;
    averageTicket: number;
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
    }).format(value);

export const DashboardSummary = ({
    pendingOrders,
    outOfStockProducts,
    saleProducts,
    averageTicket,
}: Props) => {
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

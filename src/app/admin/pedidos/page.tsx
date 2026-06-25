import { getAllOrders } from "@/app/actions/utils/orders";
import { OrderSection } from "@/components/admin/orders/orderSection/OrderSection";
import { OrderWithItems } from "@/types";
import type { Metadata } from "next";
import "./_pedidosPage.scss";

export const metadata: Metadata = {
    title: "Pedidos",
    description: "Administración de pedidos de Donna.",
};

export default async function PedidosPage() {
    const orders = await getAllOrders() as OrderWithItems[];

    return (
        <div className="pedidos-page">
            <OrderSection orders={orders} />
        </div>
    );
}

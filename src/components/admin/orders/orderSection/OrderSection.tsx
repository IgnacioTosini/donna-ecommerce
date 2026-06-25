"use client";

import { useState } from "react";
import { OrderWithItems } from "@/types";
import { OrderModal } from "../orderModal/OrderModal";
import { OrdersTable } from "../ordersTable/OrdersTable";

type Props = {
    orders: OrderWithItems[];
};

export const OrderSection = ({ orders }: Props) => {
    const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);

    return (
        <>
            <div className="pedidos-header">
                <div className="pedidos-header-text">
                    <h1 className="pedidos-title">Pedidos</h1>
                    <p className="pedidos-description">
                        {orders.length} {orders.length === 1 ? "pedido registrado" : "pedidos registrados"}
                    </p>
                </div>
            </div>

            <OrderModal
                key={selectedOrder?.id ?? "empty-order"}
                order={selectedOrder}
                isOpen={Boolean(selectedOrder)}
                onClose={() => setSelectedOrder(null)}
            />

            <OrdersTable orders={orders} onViewOrder={setSelectedOrder} />
        </>
    );
};

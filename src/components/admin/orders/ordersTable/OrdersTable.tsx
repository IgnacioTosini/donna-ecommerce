"use client";

import { FaRegTrashAlt } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { deleteOrderAction } from "@/app/actions/utils/orders";
import { SearchBar } from "@/components/shared/searchBar/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { SortDirection, useSortableTable } from "@/hooks/useSortableTable";
import { OrderStatus, OrderWithItems } from "@/types";
import { toast } from "react-toastify";
import "./_ordersTable.scss";

type Props = {
    orders: OrderWithItems[];
    onViewOrder: (order: OrderWithItems) => void;
};

type OrderSortKey = "id" | "customer" | "items" | "total" | "status" | "date";

const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
};

const statusOrder: Record<OrderStatus, number> = {
    PENDING: 1,
    CONFIRMED: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: 5,
};

const SortableHeader = ({
    label,
    direction,
    onClick,
}: {
    label: string;
    direction: SortDirection | null;
    onClick: () => void;
}) => (
    <button type="button" className="table-sort-button" onClick={onClick}>
        <span>{label}</span>
        <span className="table-sort-arrow">{direction === "asc" ? "↑" : direction === "desc" ? "↓" : "↕"}</span>
    </button>
);

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
    }).format(value);

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("es-AR", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(new Date(value));

export const OrdersTable = ({ orders, onViewOrder }: Props) => {
    const router = useRouter();
    const {
        query,
        setQuery,
        filteredItems: filteredOrders,
    } = useSearch<OrderWithItems>(
        orders,
        (order, search) =>
            order.id.toLowerCase().includes(search) ||
            order.customerName.toLowerCase().includes(search) ||
            order.phone.toLowerCase().includes(search) ||
            statusLabels[order.status].toLowerCase().includes(search) ||
            order.items.some((item) =>
                item.variant.product.name.toLowerCase().includes(search)
            )
    );

    const handleDeleteOrder = async (order: OrderWithItems) => {
        const confirmed = window.confirm(`¿Eliminar el pedido #${order.id.slice(0, 8)}?`);

        if (!confirmed) return;

        const formData = new FormData();
        formData.set("orderId", order.id);

        const result = await deleteOrderAction(formData);

        if (result.ok) {
            toast.success("Pedido eliminado");
            router.refresh();
        } else {
            toast.error(result.message ?? "Error al eliminar pedido");
        }
    };

    const {
        sortedItems: sortedOrders,
        sortBy,
        getSortDirection,
    } = useSortableTable<OrderWithItems, OrderSortKey>({
        items: filteredOrders,
        initialSort: {
            key: "date",
            direction: "desc",
        },
        columns: [
            { key: "id", accessor: (order) => order.id },
            { key: "customer", accessor: (order) => order.customerName },
            { key: "items", accessor: (order) => order.items.reduce((total, item) => total + item.quantity, 0), defaultDirection: "desc" },
            { key: "total", accessor: (order) => order.total, defaultDirection: "desc" },
            { key: "status", accessor: (order) => statusOrder[order.status] },
            { key: "date", accessor: (order) => new Date(order.createdAt), defaultDirection: "desc" },
        ],
    });

    return (
        <div className="orders-table-wrapper">
            <SearchBar
                query={query}
                onChange={setQuery}
                placeholder="Buscar pedido..."
            />

            <table className="orders-table">
                <thead>
                    <tr>
                        <th><SortableHeader label="Pedido" direction={getSortDirection("id")} onClick={() => sortBy("id")} /></th>
                        <th><SortableHeader label="Cliente" direction={getSortDirection("customer")} onClick={() => sortBy("customer")} /></th>
                        <th><SortableHeader label="Productos" direction={getSortDirection("items")} onClick={() => sortBy("items")} /></th>
                        <th><SortableHeader label="Total" direction={getSortDirection("total")} onClick={() => sortBy("total")} /></th>
                        <th><SortableHeader label="Estado" direction={getSortDirection("status")} onClick={() => sortBy("status")} /></th>
                        <th><SortableHeader label="Fecha" direction={getSortDirection("date")} onClick={() => sortBy("date")} /></th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {sortedOrders.map((order) => (
                        <tr key={order.id}>
                            <td data-label="Pedido">
                                <strong>#{order.id.slice(0, 8)}</strong>
                            </td>
                            <td data-label="Cliente">
                                <div className="order-customer">
                                    <strong>{order.customerName}</strong>
                                    <span>{order.phone}</span>
                                </div>
                            </td>
                            <td data-label="Productos">
                                <span className="order-items-count">
                                    {order.items.reduce((total, item) => total + item.quantity, 0)}
                                </span>
                            </td>
                            <td data-label="Total">{formatCurrency(order.total)}</td>
                            <td data-label="Estado">
                                <span className={`order-status order-status-${order.status.toLowerCase()}`}>
                                    {statusLabels[order.status]}
                                </span>
                            </td>
                            <td data-label="Fecha">{formatDate(order.createdAt)}</td>
                            <td data-label="Acciones">
                                <div className="order-actions">
                                    <button
                                        type="button"
                                        aria-label={`Ver pedido ${order.id}`}
                                        onClick={() => onViewOrder(order)}
                                    >
                                        <IoEyeOutline />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Eliminar pedido ${order.id}`}
                                        onClick={() => handleDeleteOrder(order)}
                                    >
                                        <FaRegTrashAlt />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {sortedOrders.length === 0 && (
                <p className="orders-empty">No se encontraron pedidos.</p>
            )}
        </div>
    );
};

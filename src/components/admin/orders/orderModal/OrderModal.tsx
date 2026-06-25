"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IoMdClose } from "react-icons/io";
import { updateOrderAction } from "@/app/actions/utils/orders";
import { OrderStatus, OrderWithItems } from "@/types";
import { toast } from "react-toastify";
import "./_orderModal.scss";

type Props = {
    isOpen: boolean;
    order: OrderWithItems | null;
    onClose: () => void;
};

const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
};

const statusOptions = Object.keys(statusLabels) as OrderStatus[];

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
    }).format(value);

const formatDate = (value: string) =>
    new Intl.DateTimeFormat("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));

export const OrderModal = ({ isOpen, order, onClose }: Props) => {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [customerName, setCustomerName] = useState(order?.customerName ?? "");
    const [phone, setPhone] = useState(order?.phone ?? "");
    const [status, setStatus] = useState<OrderStatus>(order?.status ?? "PENDING");

    if (!isOpen || !order) return null;

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsUpdating(true);

        const result = await updateOrderAction(order.id, {
            customerName,
            phone,
            status,
        });

        setIsUpdating(false);

        if (result.ok) {
            toast.success("Pedido actualizado");
            router.refresh();
            onClose();
        } else {
            toast.error(result.message ?? "No se pudo actualizar el pedido");
        }
    };

    return (
        <div className="order-modal-container">
            <div className="order-modal">
                <div className="order-modal-header">
                    <div>
                        <p className="order-modal-kicker">Pedido #{order.id.slice(0, 8)}</p>
                        <h2 className="order-modal-title">{order.customerName}</h2>
                    </div>
                    <IoMdClose className="order-modal-close" onClick={onClose} />
                </div>

                <div className="order-modal-content">
                    <section className="order-modal-summary">
                        <div>
                            <span>Telefono</span>
                            <strong>{order.phone}</strong>
                        </div>
                        <div>
                            <span>Fecha</span>
                            <strong>{formatDate(order.createdAt)}</strong>
                        </div>
                        <div>
                            <span>Total</span>
                            <strong>{formatCurrency(order.total)}</strong>
                        </div>
                    </section>

                    <form className="order-modal-form" onSubmit={handleSubmit}>
                        <label className="order-modal-field">
                            <span>Nombre del cliente</span>
                            <input
                                type="text"
                                value={customerName}
                                disabled={isUpdating}
                                required
                                onChange={(event) => setCustomerName(event.target.value)}
                            />
                        </label>

                        <label className="order-modal-field">
                            <span>Telefono</span>
                            <input
                                type="tel"
                                value={phone}
                                disabled={isUpdating}
                                required
                                onChange={(event) => setPhone(event.target.value)}
                            />
                        </label>

                        <label className="order-modal-field">
                            <span>Estado del pedido</span>
                            <select
                                value={status}
                                disabled={isUpdating}
                                onChange={(event) => setStatus(event.target.value as OrderStatus)}
                            >
                                {statusOptions.map((orderStatus) => (
                                    <option key={orderStatus} value={orderStatus}>
                                        {statusLabels[orderStatus]}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button
                            type="submit"
                            className="order-modal-submit"
                            disabled={isUpdating}
                        >
                            {isUpdating ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </form>

                    <section className="order-modal-items">
                        <h3>Productos</h3>
                        <ul>
                            {order.items.map((item) => (
                                <li key={item.id}>
                                    <div>
                                        <strong>{item.variant.product.name}</strong>
                                        <span>
                                            {item.variant.name ?? item.variant.colorHex}
                                            {item.productSizeStock?.size ? ` / Talle ${item.productSizeStock.size}` : ""}
                                        </span>
                                    </div>
                                    <div className="order-modal-item-price">
                                        <span>x{item.quantity}</span>
                                        <strong>{formatCurrency(item.price * item.quantity)}</strong>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

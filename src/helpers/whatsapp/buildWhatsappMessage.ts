import { CartItem } from "@/store/cart.store";

type Props = {
    orderId: string;
    customerName: string;
    phone: string;
    notes?: string;
    items: CartItem[];
    subtotal: number;
};

export function buildWhatsappMessage({
    orderId,
    customerName,
    phone,
    notes,
    items,
    subtotal,
}: Props) {
    const products = items
        .map(
            (item) => `• ${item.name}
Cantidad: ${item.quantity}
Precio unitario: $${item.price.toLocaleString("es-AR")}
Subtotal: $${(item.price * item.quantity).toLocaleString("es-AR")}`
        )
        .join("\n\n");

    return `Hola Donna.

Quiero confirmar el pedido #${orderId}

${products}

Total: $${subtotal.toLocaleString("es-AR")}

Nombre: ${customerName}
Teléfono: ${phone}

${notes ? `Observaciones: ${notes}` : ""}`;
}
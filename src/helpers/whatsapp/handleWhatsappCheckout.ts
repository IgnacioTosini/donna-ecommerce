import { CartItem } from "@/store/cart.store";
import { buildWhatsappMessage } from "./buildWhatsappMessage";
import { openWhatsappUrl, shouldUseWhatsappAppUrl } from "./getWhatsappUrl";
import { CheckoutData } from "@/types/checkout.types";
import { createOrderAction } from "@/app/actions/utils/orders";

type Props = CheckoutData & {
    items: CartItem[];
    subtotal: number;
    whatsappPhone: string;
    businessName: string;
};

export async function handleWhatsappCheckout({
    customerName,
    phone,
    notes,
    items,
    subtotal,
    whatsappPhone,
    businessName,
}: Props) {

    if (!whatsappPhone) {
        return {
            ok: false,
            message: "Contactanos por Instagram para coordinar tu pedido.",
        };
    }

    const openInWhatsappApp = shouldUseWhatsappAppUrl();
    const whatsappWindow =
        typeof window !== "undefined" && !openInWhatsappApp
            ? window.open("", "_blank")
            : null;

    const result = await createOrderAction({
        customerName,
        phone,
        notes,
        items: items.map((item) => ({
            variantId: item.variantId,
            productSizeStockId:
                item.productSizeStockId,
            quantity: item.quantity,
        })),
    }).catch(() => {
        whatsappWindow?.close();

        return {
            ok: false,
            message: "No pudimos crear el pedido.",
        };
    });

    if (!result.ok || !("order" in result) || !result.order) {
        whatsappWindow?.close();

        return {
            ok: false,
            message: "message" in result ? result.message : "No pudimos crear el pedido.",
        };
    }

    const { order } = result;

    const message = buildWhatsappMessage({
        businessName,
        orderId: order.id,
        customerName,
        phone,
        notes,
        items,
        subtotal,
    });

    if (whatsappWindow) {
        openWhatsappUrl(whatsappPhone, message, whatsappWindow);
    } else {
        openWhatsappUrl(whatsappPhone, message);
    }

    return {
        ok: true,
        order,
    };
}

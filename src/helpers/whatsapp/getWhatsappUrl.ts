export function getWhatsappUrl(
    phone: string,
    message: string
) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(
        message
    )}`;
}
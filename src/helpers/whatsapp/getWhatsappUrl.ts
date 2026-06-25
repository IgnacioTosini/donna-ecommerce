const getWhatsappPhone = (phone: string) => phone.replace(/\D/g, "");

const isIOSDevice = () => {
    if (typeof navigator === "undefined") return false;

    return (
        /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
};

const isAndroidDevice = () =>
    typeof navigator !== "undefined" &&
    /Android/i.test(navigator.userAgent);

export const shouldUseWhatsappAppUrl = () =>
    isIOSDevice() || isAndroidDevice();

export function getWhatsappUrl(
    phone: string,
    message: string
) {
    const whatsappPhone = getWhatsappPhone(phone);

    return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
        message
    )}`;
}

export function getWhatsappAppUrl(
    phone: string,
    message: string
) {
    const whatsappPhone = getWhatsappPhone(phone);

    return `whatsapp://send?phone=${whatsappPhone}&text=${encodeURIComponent(
        message
    )}`;
}

export function openWhatsappUrl(
    phone: string,
    message: string,
    targetWindow?: Window | null
) {
    const webUrl = getWhatsappUrl(phone, message);
    const appUrl = getWhatsappAppUrl(phone, message);
    const shouldUseAppUrl = shouldUseWhatsappAppUrl();
    const target = targetWindow ?? window;

    target.location.assign(shouldUseAppUrl ? appUrl : webUrl);
}

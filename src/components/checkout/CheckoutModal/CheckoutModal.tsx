"use client";

import { FormEvent, useState } from "react";
import { IoClose } from "react-icons/io5";
import { CheckoutData } from "@/types/checkout.types";
import "./_checkoutModal.scss";

type Props = {
    isOpen: boolean;
    title?: string;
    submitLabel?: string;
    onClose: () => void;
    onSubmit: (data: CheckoutData) => Promise<boolean>;
};

const initialForm: CheckoutData = {
    customerName: "",
    phone: "",
    notes: "",
};

export const CheckoutModal = ({
    isOpen,
    title = "Datos para finalizar la compra",
    submitLabel = "Enviar pedido por WhatsApp",
    onClose,
    onSubmit,
}: Props) => {
    const [form, setForm] = useState<CheckoutData>(initialForm);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleClose = () => {
        if (isSubmitting) return;

        onClose();
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isSubmitting) return;

        setIsSubmitting(true);

        let ok = false;

        try {
            ok = await onSubmit({
                customerName: form.customerName.trim(),
                phone: form.phone.trim(),
                notes: form.notes?.trim(),
            });
        } finally {
            setIsSubmitting(false);
        }

        if (ok) {
            setForm(initialForm);
        }
    };

    return (
        <div className="checkout-modal-container" role="presentation">
            <button
                type="button"
                className="checkout-modal-backdrop"
                aria-label="Cerrar checkout"
                onClick={handleClose}
            />

            <section
                className="checkout-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="checkout-modal-title"
            >
                <header className="checkout-modal-header">
                    <h2 id="checkout-modal-title">{title}</h2>
                    <button
                        type="button"
                        className="checkout-modal-close"
                        aria-label="Cerrar checkout"
                        disabled={isSubmitting}
                        onClick={handleClose}
                    >
                        <IoClose />
                    </button>
                </header>

                <form className="checkout-modal-form" onSubmit={handleSubmit}>
                    <label className="checkout-modal-field">
                        <span>Nombre y apellido</span>
                        <input
                            type="text"
                            value={form.customerName}
                            autoComplete="name"
                            required
                            disabled={isSubmitting}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    customerName: event.target.value,
                                }))
                            }
                        />
                    </label>

                    <label className="checkout-modal-field">
                        <span>Telefono</span>
                        <input
                            type="tel"
                            value={form.phone}
                            autoComplete="tel"
                            required
                            disabled={isSubmitting}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    phone: event.target.value,
                                }))
                            }
                        />
                    </label>

                    <label className="checkout-modal-field">
                        <span>Observaciones</span>
                        <textarea
                            value={form.notes}
                            rows={3}
                            disabled={isSubmitting}
                            placeholder="Direccion, horario o detalle que quieras sumar"
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    notes: event.target.value,
                                }))
                            }
                        />
                    </label>

                    <button
                        type="submit"
                        className="checkout-modal-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creando pedido..." : submitLabel}
                    </button>
                </form>
            </section>
        </div>
    );
};

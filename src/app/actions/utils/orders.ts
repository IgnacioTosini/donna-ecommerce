"use server";

import { prisma } from "@/lib/prisma";
import { serializePrisma } from "@/lib/serializePrisma";
import { OrderStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

type CreateOrderInput = {
    customerName: string;
    phone: string;
    notes?: string;

    items: {
        variantId: string;
        productSizeStockId: string;
        quantity: number;
    }[];
};

class OrderCreationError extends Error { }
class OrderUpdateError extends Error { }

const revalidateOrderSurfaces = (slugs: string[] = []) => {
    revalidatePath("/admin");
    revalidatePath("/admin/productos");
    revalidatePath("/admin/pedidos");
    revalidatePath("/");
    revalidatePath("/categoria");

    for (const slug of slugs) {
        revalidatePath(`/producto/${slug}`);
    }
};

const getOrderForStockUpdate = async (
    tx: Prisma.TransactionClient,
    orderId: string
) => {
    const order = await tx.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                    productSizeStock: true,
                },
            },
        },
    });

    if (!order) {
        throw new OrderUpdateError("Pedido no encontrado.");
    }

    return order;
};

const restoreOrderStock = async (
    tx: Prisma.TransactionClient,
    order: Awaited<ReturnType<typeof getOrderForStockUpdate>>
) => {
    for (const item of order.items) {
        if (!item.productSizeStockId) continue;

        await tx.productSizeStock.update({
            where: {
                id: item.productSizeStockId,
            },
            data: {
                stock: {
                    increment: item.quantity,
                },
            },
        });
    }
};

const reserveOrderStock = async (
    tx: Prisma.TransactionClient,
    order: Awaited<ReturnType<typeof getOrderForStockUpdate>>
) => {
    for (const item of order.items) {
        if (!item.productSizeStockId) {
            throw new OrderUpdateError(
                `No se puede reactivar ${item.variant.product.name}: falta el talle asociado.`
            );
        }

        const stockUpdated = await tx.productSizeStock.updateMany({
            where: {
                id: item.productSizeStockId,
                variantId: item.variantId,
                stock: {
                    gte: item.quantity,
                },
                variant: {
                    is: {
                        product: {
                            is: {
                                active: true,
                            },
                        },
                    },
                },
            },
            data: {
                stock: {
                    decrement: item.quantity,
                },
            },
        });

        if (stockUpdated.count === 0) {
            const latestSizeStock = await tx.productSizeStock.findUnique({
                where: {
                    id: item.productSizeStockId,
                },
            });

            throw new OrderUpdateError(
                `No se puede reactivar ${item.variant.product.name}. Stock disponible: ${latestSizeStock?.stock ?? 0}.`
            );
        }
    }
};

const applyOrderStatusStockTransition = async (
    tx: Prisma.TransactionClient,
    orderId: string,
    nextStatus: OrderStatus
) => {
    const order = await getOrderForStockUpdate(tx, orderId);

    if (order.status !== OrderStatus.CANCELLED && nextStatus === OrderStatus.CANCELLED) {
        await restoreOrderStock(tx, order);
    }

    if (order.status === OrderStatus.CANCELLED && nextStatus !== OrderStatus.CANCELLED) {
        await reserveOrderStock(tx, order);
    }

    return order;
};

export async function createOrderAction(
    data: CreateOrderInput
) {
    if (data.items.length === 0) {
        return {
            ok: false,
            message: "El carrito está vacío.",
        };
    }

    const normalizedItems = Array.from(
        data.items.reduce((itemsMap, item) => {
            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new OrderCreationError("Cantidad inválida en el pedido.");
            }

            const key = `${item.variantId}-${item.productSizeStockId}`;
            const currentItem = itemsMap.get(key);

            itemsMap.set(key, {
                variantId: item.variantId,
                productSizeStockId: item.productSizeStockId,
                quantity: (currentItem?.quantity ?? 0) + quantity,
            });

            return itemsMap;
        }, new Map<string, CreateOrderInput["items"][number]>())
            .values()
    );

    try {
        const order = await prisma.$transaction(async (tx) => {
            let total = 0;

            const orderItems: {
                variantId: string;
                productSizeStockId: string;
                quantity: number;
                price: number;
            }[] = [];

            for (const item of normalizedItems) {
                const sizeStock =
                    await tx.productSizeStock.findUnique({
                        where: {
                            id: item.productSizeStockId,
                        },
                        include: {
                            variant: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    });

                if (
                    !sizeStock ||
                    sizeStock.variantId !== item.variantId
                ) {
                    throw new OrderCreationError("Variante no encontrada.");
                }

                if (!sizeStock.variant.product.active) {
                    throw new OrderCreationError(
                        `${sizeStock.variant.product.name} ya no está disponible.`
                    );
                }

                const stockUpdated =
                    await tx.productSizeStock.updateMany({
                        where: {
                            id: item.productSizeStockId,
                            variantId: item.variantId,
                            stock: {
                                gte: item.quantity,
                            },
                            variant: {
                                is: {
                                    product: {
                                        is: {
                                            active: true,
                                        },
                                    },
                                },
                            },
                        },
                        data: {
                            stock: {
                                decrement:
                                    item.quantity,
                            },
                        },
                    });

                if (stockUpdated.count === 0) {
                    const latestSizeStock =
                        await tx.productSizeStock.findUnique({
                            where: {
                                id: item.productSizeStockId,
                            },
                            include: {
                                variant: {
                                    include: {
                                        product: true,
                                    },
                                },
                            },
                        });

                    if (!latestSizeStock?.variant.product.active) {
                        throw new OrderCreationError(
                            `${sizeStock.variant.product.name} ya no está disponible.`
                        );
                    }

                    throw new OrderCreationError(
                        `Stock insuficiente para ${sizeStock.variant.product.name}. Disponible: ${latestSizeStock.stock}.`
                    );
                }

                const price = Number(
                    sizeStock.variant.product.price
                );

                total +=
                    price * item.quantity;

                orderItems.push({
                    variantId: item.variantId,
                    productSizeStockId:
                        item.productSizeStockId,
                    quantity: item.quantity,
                    price,
                });
            }

            return tx.order.create({
                    data: {
                        customerName:
                            data.customerName,
                        phone: data.phone,
                        total,
                        status:
                            OrderStatus.PENDING,

                        items: {
                            create: orderItems,
                        },
                    },
                    include: {
                        items: {
                            include: {
                                variant: {
                                    include: {
                                        product: true,
                                    },
                                },
                                productSizeStock:
                                    true,
                            },
                        },
                    },
                });
        });

        revalidateOrderSurfaces(
            order.items.map((item) => item.variant.product.slug)
        );

        return {
            ok: true,
            order: serializePrisma(order),
        }
    } catch (error) {
        if (error instanceof OrderCreationError) {
            return {
                ok: false,
                message: error.message,
            };
        }

        console.error(error);

        return {
            ok: false,
            message: "No pudimos crear el pedido.",
        };
    }
}

export async function getAllOrders() {
    const orders = await prisma.order.findMany({
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                    productSizeStock: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return serializePrisma(orders);
}

export async function getOrderById(
    orderId: string
) {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
            items: {
                include: {
                    variant: {
                        include: {
                            product: true,
                        },
                    },
                    productSizeStock: true,
                },
            },
        },
    });

    return serializePrisma(order);
}

export async function updateOrderStatusAction(
    formData: FormData
) {
    const orderId = formData.get("orderId") as string;
    const status = formData.get("status") as OrderStatus;

    return updateOrderStatusByIdAction(orderId, status);
}

export async function updateOrderStatusByIdAction(
    orderId: string,
    status: OrderStatus
) {
    try {
        const order = await prisma.$transaction(async (tx) => {
            const currentOrder = await applyOrderStatusStockTransition(
                tx,
                orderId,
                status
            );

            return tx.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status,
                },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true,
                                },
                            },
                            productSizeStock: true,
                        },
                    },
                },
            }).then((updatedOrder) => ({
                updatedOrder,
                slugs: currentOrder.items.map((item) => item.variant.product.slug),
            }));
        });

        revalidateOrderSurfaces(order.slugs);

        return {
            ok: true,
            order: serializePrisma(order.updatedOrder),
        };
    } catch (error) {
        if (error instanceof OrderUpdateError) {
            return {
                ok: false,
                message: error.message,
            };
        }

        console.error(error);

        return {
            ok: false,
            message: "No se pudo actualizar el estado del pedido.",
        };
    }
}

export async function updateOrderAction(
    orderId: string,
    data: {
        customerName: string;
        phone: string;
        status: OrderStatus;
    }
) {
    const customerName = data.customerName.trim();
    const phone = data.phone.trim();

    if (!customerName || !phone) {
        return {
            ok: false,
            message: "Nombre y teléfono son obligatorios.",
        };
    }

    try {
        const order = await prisma.$transaction(async (tx) => {
            const currentOrder = await applyOrderStatusStockTransition(
                tx,
                orderId,
                data.status
            );

            const updatedOrder = await tx.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    customerName,
                    phone,
                    status: data.status,
                },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true,
                                },
                            },
                            productSizeStock: true,
                        },
                    },
                },
            });

            return {
                updatedOrder,
                slugs: currentOrder.items.map((item) => item.variant.product.slug),
            };
        });

        revalidateOrderSurfaces(order.slugs);

        return {
            ok: true,
            order: serializePrisma(order.updatedOrder),
        };
    } catch (error) {
        if (error instanceof OrderUpdateError) {
            return {
                ok: false,
                message: error.message,
            };
        }

        console.error(error);

        return {
            ok: false,
            message: "No se pudo actualizar el pedido.",
        };
    }
}

export async function deleteOrderAction(
    formData: FormData
) {
    const orderId = formData.get("orderId") as string;

    try {
        const slugs = await prisma.$transaction(async (tx) => {
            const order = await getOrderForStockUpdate(tx, orderId);

            if (order.status !== OrderStatus.CANCELLED) {
                await restoreOrderStock(tx, order);
            }

            await tx.order.delete({
                where: {
                    id: orderId,
                },
            });

            return order.items.map((item) => item.variant.product.slug);
        });

        revalidateOrderSurfaces(slugs);

        return {
            ok: true,
        };
    } catch (error) {
        if (error instanceof OrderUpdateError) {
            return {
                ok: false,
                message: error.message,
            };
        }

        console.error(error);

        return {
            ok: false,
            message: "No se pudo eliminar el pedido.",
        };
    }
}

import { Prisma } from "@prisma/client";

export type Serialized<T> =
    T extends Prisma.Decimal
        ? number
        : T extends Date
            ? string
            : T extends Array<infer U>
                ? Serialized<U>[]
                : T extends object
                    ? {
                        [K in keyof T]: Serialized<T[K]>;
                    }
                    : T;

export function serializePrisma<T>(
    data: T
): Serialized<T> {
    return JSON.parse(
        JSON.stringify(
            data,
            (_, value) =>
                typeof value === "object" &&
                    value?.constructor?.name === "Decimal"
                    ? Number(value)
                    : value
        )
    );
}
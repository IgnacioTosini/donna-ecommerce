const ADMIN_SESSION_DURATION_SECONDS = 60 * 60 * 24;
const encoder = new TextEncoder();

const getSessionSecret = () =>
    process.env.ADMIN_SESSION_SECRET
    ?? process.env.INTERNAL_API_KEY
    ?? process.env.SECRET_API_KEY
    ?? process.env.DATABASE_URL;

const toBase64Url = (bytes: Uint8Array) => {
    let binary = '';

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });

    return btoa(binary)
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replaceAll('=', '');
};

const fromBase64Url = (value: string) => {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);

    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const getSigningKey = async () => {
    const secret = getSessionSecret();

    if (!secret) return null;

    return crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
};

export const createAdminSessionToken = async () => {
    const key = await getSigningKey();

    if (!key) {
        throw new Error('No hay un secreto de servidor para firmar la sesión.');
    }

    const expiresAt = String(
        Date.now() + ADMIN_SESSION_DURATION_SECONDS * 1000
    );
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(expiresAt)
    );

    return `${expiresAt}.${toBase64Url(new Uint8Array(signature))}`;
};

export const verifyAdminSessionToken = async (token?: string) => {
    if (!token) return false;

    const [expiresAt, encodedSignature, ...extraParts] = token.split('.');
    const expiration = Number(expiresAt);

    if (
        extraParts.length > 0
        || !expiresAt
        || !encodedSignature
        || !Number.isFinite(expiration)
        || expiration <= Date.now()
    ) {
        return false;
    }

    try {
        const key = await getSigningKey();

        if (!key) return false;

        return crypto.subtle.verify(
            'HMAC',
            key,
            fromBase64Url(encodedSignature),
            encoder.encode(expiresAt)
        );
    } catch {
        return false;
    }
};

export { ADMIN_SESSION_DURATION_SECONDS };

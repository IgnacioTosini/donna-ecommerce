import { cookies } from "next/headers";
import { verifyAdminSessionToken } from "./admin-session-token";

export async function isAdminAuthenticated() {
    const cookieStore = await cookies();

    return verifyAdminSessionToken(
        cookieStore.get("admin-session")?.value
    );
}

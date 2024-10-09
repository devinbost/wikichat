import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import type { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "JWT secret";

async function verifyJWT(token: string, secret: string) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);

    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT");

    const [header, payload, signature] = parts;
    const signedData = `${header}.${payload}`;

    const signatureBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, signatureBuffer, new TextEncoder().encode(signedData));

    if (!valid) throw new Error("Invalid token signature");

    return JSON.parse(atob(payload)); // Decode payload
}

export async function middleware(request: NextRequest) {
    const cookieStore = cookies(); // Use cookies() to access the cookies
    const token = cookieStore.get("token")?.value; // Ensure correct method

    if (token) {
        try {
            const payload = await verifyJWT(token, JWT_SECRET);

            // Check if the token is expired
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            if (payload.exp && currentTime > payload.exp) {
                console.log("Token is expired");
                return NextResponse.redirect(new URL("/login", request.url));
            }
            if (payload.role === "end-user") {
                return NextResponse.redirect(new URL("/", request.url));
            }

            // Token is valid and not expired
            return NextResponse.next();
        } catch (err) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    } else {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/dashboard"],
};

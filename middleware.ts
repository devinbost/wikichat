import { NextResponse, NextRequest } from "next/server";
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

// Convert Base64URL-encoded string to Uint8Array
function base64UrlDecode(input: string) {
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = input.length % 4 === 0 ? '' : new Array(4 - (input.length % 4)).fill('=').join('');
    const binaryString = atob(input + pad);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Verify JWT using Web Crypto API
async function verifyJWT(token: string, secret: string) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    // Import the secret key to be used for verification
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);

    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT");

    const [header, payload, signature] = parts;
    const signedData = `${header}.${payload}`;

    // Decode the signature
    const signatureBuffer = base64UrlDecode(signature);

    // Verify the signature using Web Crypto API
    const valid = await crypto.subtle.verify(
        "HMAC",
        key,
        signatureBuffer,
        new TextEncoder().encode(signedData)
    );

    if (!valid) throw new Error("Invalid token signature");

    // Return decoded payload
    return JSON.parse(atob(payload));
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip authentication checks for the /login page and /api/auth routes
    if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
        try {
            const payload = await verifyJWT(token, JWT_SECRET);
            const currentTime = Math.floor(Date.now() / 1000);

            if (payload.exp && currentTime > payload.exp) {
                console.log("Token is expired");
                return NextResponse.redirect(new URL("/login", request.url));
            }

            if (!payload.role) {
                console.log("No role found in token");
                return NextResponse.redirect(new URL("/login", request.url));
            }

            if (payload.role === "end-user") {
                return NextResponse.redirect(new URL("/", request.url));
            }

            if (pathname.startsWith("/api/createUser") || pathname.startsWith("/api/updateUser") || pathname.startsWith("/users")) {
                if (payload.role !== "admin") {
                    console.log("User does not have admin privileges");
                    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
                }
            }

            return NextResponse.next();
        } catch (err) {
            console.error("JWT verification failed:", err.message);
            return NextResponse.redirect(new URL("/login", request.url));
        }
    } else {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: [
        "/dashboard", 
        "/users", 
        "/api/createUser", 
        "/api/updateUser",
    ],
};
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Convert Base64URL-encoded string to Uint8Array
function base64UrlDecode(input: string): Uint8Array {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const binaryString = Buffer.from(base64, 'base64').toString('binary');
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

// Verify JWT using Web Crypto API
async function verifyJWT(token: string, secret: string) {
    console.log("Starting JWT verification");
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    let key;

    try {
        console.log("Importing secret key for HMAC verification");
        key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: { name: 'SHA-256' } },
            false,
            ['verify']
        );
    } catch (error) {
        console.error("Error importing key for HMAC:", error);
        throw new Error("Key import failed");
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
        console.error("Invalid JWT format");
        throw new Error("Invalid JWT");
    }

    const [header, payload, signature] = parts;
    console.log("JWT structure valid, proceeding with signature verification");

    const signedData = `${header}.${payload}`;
    const signatureBuffer = base64UrlDecode(signature);

    let valid;
    try {
        valid = await crypto.subtle.verify(
            'HMAC',
            key,
            signatureBuffer,
            encoder.encode(signedData)
        );
    } catch (error) {
        console.error("Error during JWT signature verification:", error);
        throw new Error("Verification failed");
    }

    if (!valid) {
        console.error("Token signature invalid");
        throw new Error("Invalid token signature");
    }

    console.log("Token signature valid, parsing payload");
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
}

// Function to construct the base URL from request headers
function getBaseUrl(request: NextRequest): string {
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    return `${protocol}://${host}`;
}

// Middleware function
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    console.log(`Processing request for path: ${pathname}`);

    return NextResponse.next();

    // // Skip authentication checks for public routes
    // if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    //     console.log("Public route accessed, skipping authentication checks");
    //     return NextResponse.next();
    // }

    // const cookieStore = cookies();
    // const token = cookieStore.get("token")?.value;

    // if (!token) {
    //     console.warn("No token found in cookies, redirecting to login");
    //     const loginUrl = new URL('/login', getBaseUrl(request));
    //     loginUrl.searchParams.set('callbackUrl', request.url);
    //     return NextResponse.redirect(loginUrl);
    // }

    // try {
    //     console.log("Token found, verifying JWT");
    //     const payload = await verifyJWT(token, JWT_SECRET as string);
    //     console.log("JWT verified successfully");

    //     if (!payload.role) {
    //         console.warn("No role found in token, redirecting to login");
    //         const loginUrl = new URL('/login', getBaseUrl(request));
    //         loginUrl.searchParams.set('callbackUrl', request.url);
    //         return NextResponse.redirect(loginUrl);
    //     }

    //     console.log(`User role: ${payload.role}`);

    //     if (payload.role === "end-user") {
    //         console.log("End-user role detected, redirecting to home page");
    //         return NextResponse.redirect(new URL("/", getBaseUrl(request)));
    //     }

    //     if (pathname.startsWith("/dashboard")) {
    //         if (payload.role !== "admin" && payload.role !== "power-user") {
    //             console.warn("User lacks dashboard access privileges");
    //             return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    //         }
    //         console.log("Dashboard access granted");
    //     }

    //     if (pathname.startsWith("/api/createUser") || 
    //         pathname.startsWith("/api/updateUser") || 
    //         pathname.startsWith("/users")) {
    //         if (payload.role !== "admin") {
    //             console.warn("User lacks admin privileges for user management");
    //             return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    //         }
    //         console.log("Admin access granted for user management");
    //     }

    //     console.log("Access granted for requested path");
    //     return NextResponse.next();
    // } catch (err) {
    //     console.error("JWT verification failed:", err.message);
    //     const loginUrl = new URL('/login', getBaseUrl(request));
    //     loginUrl.searchParams.set('callbackUrl', request.url);
    //     return NextResponse.redirect(loginUrl);
    // }
}

export const config = {
    matcher: [
        "/dashboard", 
        "/users", 
        "/api/createUser", 
        "/api/updateUser",
    ],
};
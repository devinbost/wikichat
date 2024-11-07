import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";


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
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    
    // Import the secret key to be used for verification
    // Import the secret key to be used for verification
    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['verify']
    );
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT");

    const [header, payload, signature] = parts;
    const signedData = `${header}.${payload}`;

    // Decode the signature
    const signatureBuffer = base64UrlDecode(signature);

    // Verify the signature using Web Crypto API
    const valid = await crypto.subtle.verify(
        'HMAC',
        key,
        signatureBuffer,
        encoder.encode(signedData)
      );

      if (!valid) throw new Error('Invalid token signature');

      // Return decoded payload
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip authentication checks for the /login page and /api/auth routes
    if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        console.log("Token not found, redirecting to login");
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const payload = await verifyJWT(token, JWT_SECRET as string);
        const currentTime = Math.floor(Date.now() / 1000);

        if (!payload.role) {
            console.log("No role found in token");
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (payload.role === "end-user") {
            return NextResponse.redirect(new URL("/", request.url));
        }
        if (pathname.startsWith("/dashboard")){
            if (payload.role !== "admin" && payload.role !== "power-user") {
                console.log("User does not have admin privileges");
                return NextResponse.json({ message: "Forbidden" }, { status: 403 });
            }
        }

        if (pathname.startsWith("/api/createUser") || 
            pathname.startsWith("/api/updateUser") || 
            pathname.startsWith("/users")) {
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
}

export const config = {
    matcher: [
        "/dashboard", 
        "/users", 
        "/api/createUser", 
        "/api/updateUser",
    ],
};
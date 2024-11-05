import { NextResponse, NextRequest } from "next/server";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";


async function verifyJWT(token: string, secret: string) {
    try {
      // Verify token using `jsonwebtoken` library
      const payload = jwt.verify(token, secret) as JwtPayload;
  
      // Return the payload if verification succeeds
      return payload;
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      throw new Error("Invalid token signature or token expired");
    }
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
}

export const config = {
    matcher: [
        "/dashboard", 
        "/users", 
        "/api/createUser", 
        "/api/updateUser",
    ],
};
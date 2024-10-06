import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import getCassandraClient from "../../../lib/db";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "JWT secret";

interface CustomJwtPayload extends JwtPayload {
    email: string;
    role: string;
}
async function queryPermissionsForRole(role: string, resource_name: string) {
    try {
        const cassandraClient = await getCassandraClient();
        const query =
            "SELECT * FROM default_namespace.role_permissions WHERE role = ? AND resource_name = ? ALLOW FILTERING";
        const result = await cassandraClient.execute(query, [role, resource_name], { prepare: true });

        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error querying permissions: ", error);
        throw new Error("Database query failed");
    }
}

export async function POST(request: Request) {
    try {
        const { resource_name } = await request.json();
        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Authentication token not found" }, { status: 401 });
        }

        // Verify and decode the JWT
        const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;

        if (!decoded || !decoded.role) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const permissions = await queryPermissionsForRole(decoded.role, resource_name);

        if (permissions) {
            return NextResponse.json({ message: "Permissions fetched successfully", permissions }, { status: 200 });
        } else {
            return NextResponse.json({ message: "No permissions found for the role" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error fetching permissions: ", error);
        return NextResponse.json({ message: "Failed to fetch permissions", error: error.message }, { status: 500 });
    }
}

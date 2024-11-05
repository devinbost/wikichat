import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import getCassandraClient from "../../../lib/db";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";

interface CustomJwtPayload extends JwtPayload {
    email: string;
    role: string;
}
async function queryPermissionForRole(role: string, resource_name: string) {
    try {
        const cassandraClient = await getCassandraClient();
        const query =
            "SELECT role, resource_name, can_add, can_delete, can_modify, can_view FROM default_namespace.role_permissions WHERE role = ? AND resource_name = ? ALLOW FILTERING";
        const result = await cassandraClient.execute(query, [role, resource_name], { prepare: true });

        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error querying permission: ", error);
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

        const permission = await queryPermissionForRole(decoded.role, resource_name);

        if (permission) {
            return NextResponse.json({ message: "Permission fetched successfully", permission }, { status: 200 });
        } else {
            return NextResponse.json({ message: "No permission found for the role" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error fetching permission: ", error);
        return NextResponse.json({ message: "Failed to fetch permission", error: error.message }, { status: 500 });
    }
}

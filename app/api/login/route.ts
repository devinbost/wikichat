import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import getCassandraClient from "../../../lib/db";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "JWT secret";

async function queryCQLDatabase(email: string) {
    try {
        const cassandraClient = await getCassandraClient();
        const query = "SELECT * FROM default_namespace.users WHERE email = ? ALLOW FILTERING";
        const result = await cassandraClient.execute(query, [email], { prepare: true });
        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error querying the database: ", error);
        throw new Error("Database query failed");
    }
}

export async function POST(request: Request) {
    const { email, password } = await request.json();

    // Query the CQL database to check for the user
    const user = await queryCQLDatabase(email);

    if (user) {
        // Compare the provided password with the hashed password stored in the database
        const passwordMatch = bcrypt.compareSync(password, user.hashed_password);

        if (passwordMatch) {
            const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

            const response = NextResponse.json({ message: "Login successful", role: user.role });
            // Set the JWT in an HTTP-only cookie
            response.cookies.set("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 });

            return response;
        } else {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }
    } else {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
}

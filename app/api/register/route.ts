import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import getCassandraClient from "../../../lib/db";

// Number of bcrypt salt rounds
const SALT_ROUNDS = bcrypt.genSaltSync(10);

async function insertUserIntoCQLDatabase(
    userId: string,
    email: string,
    hashedPassword: string,
    role: string,
    createdAt: Date,
    updatedAt: Date,
) {
    try {
        const cassandraClient = await getCassandraClient();
        const query = `
            INSERT INTO default_namespace.users (user_id, email, hashed_password, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const params = [userId, email, hashedPassword, role, createdAt, updatedAt];
        await cassandraClient.execute(query, params, { prepare: true });
    } catch (error) {
        console.error("Error inserting into the database: ", error);
        throw new Error("Database insertion failed");
    }
}

export async function POST(request: Request) {
    try {
        const { email, password, role } = await request.json();

        const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
        const userId = uuidv4();
        const createdAt = new Date();
        const updatedAt = new Date();
        await insertUserIntoCQLDatabase(userId, email, hashedPassword, role, createdAt, updatedAt);

        return NextResponse.json({ message: "Registration successful" }, { status: 201 });
    } catch (error) {
        console.error("Error during registration: ", error);
        return NextResponse.json({ message: "Registration failed", error: error.message }, { status: 500 });
    }
}

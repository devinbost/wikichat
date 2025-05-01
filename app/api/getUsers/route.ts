import { NextResponse } from "next/server";
import getCassandraClient from "../../../lib/db";

async function fetchUsersFromCQLDatabase() {
    try {
        const cassandraClient = await getCassandraClient();
        const cql_query = `
            SELECT user_id, email, role FROM default_namespace.users;
        `;
        const result = await cassandraClient.execute(cql_query, { prepare: true });

        return result.rows;
    } catch (error) {
        console.error("Error fetching from the database: ", error);
        throw new Error("Database fetch failed");
    }
}

export async function GET() {
    try {
        const records = await fetchUsersFromCQLDatabase();
        return NextResponse.json({ message: "Users fetched successfully", data: records }, { status: 200 });
    } catch (error) {
        console.error("Error during fetching users: ", error);
        return NextResponse.json({ message: "User fetching failed", error: error.message }, { status: 500 });
    }
}
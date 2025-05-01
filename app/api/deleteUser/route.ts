import { NextResponse } from "next/server";
import getCassandraClient from "../../../lib/db";

async function deleteUserFromCQLDatabase(user_id: string) {
    try {
        const cassandraClient = await getCassandraClient();
        const cql_query = `
            DELETE FROM default_namespace.users WHERE user_id = ?;
        `;
        const params = [user_id];
        await cassandraClient.execute(cql_query, params, { prepare: true });
    } catch (error) {
        console.error("Error deleting from the database: ", error);
        throw new Error("Database deletion failed");
    }
}

export async function POST(request: Request) {
    try {
        const { user_id } = await request.json();
        await deleteUserFromCQLDatabase(user_id);

        return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error during user deletion: ", error);
        return NextResponse.json({ message: "User deletion failed", error: error.message }, { status: 500 });
    }
}
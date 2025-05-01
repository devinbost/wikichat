import { NextResponse } from "next/server";
import getCassandraClient from "../../../lib/db";

async function updateUserInCQLDatabase(user_id: string, role: string, email: string) {
    try {
        const cassandraClient = await getCassandraClient();
        const cql_query = `
            UPDATE default_namespace.users
            SET role = ?, email = ?
            WHERE user_id = ?
        `;
        const params = [role, email, user_id];
        await cassandraClient.execute(cql_query, params, { prepare: true });
    } catch (error) {
        console.error("Error updating the database: ", error);
        throw new Error("Database update failed");
    }
}

export async function POST(request: Request) {
    
    try {
        const { user_id, formRole, formEmail } = await request.json();
        await updateUserInCQLDatabase(user_id, formRole, formEmail);

        return NextResponse.json({ message: "User Updated successful" }, { status: 201 });
    } catch (error) {
        console.error("Error during User Update: ", error);
        return NextResponse.json({ message: "User Update failed", error: error.message }, { status: 500 });
    }
}

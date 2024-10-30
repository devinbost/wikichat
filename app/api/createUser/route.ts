import { NextResponse } from "next/server";
import getCassandraClient from "../../../lib/db";
import { v4 as uuidv4 } from "uuid"; 


async function createUserInCQLDatabase(user_id: string, role: string, email: string) {
    try {
        const cassandraClient = await getCassandraClient();
        const cql_query = `
            INSERT INTO default_namespace.users (user_id, role, email) VALUES (?, ?, ?);
        `;
        const params = [user_id, role, email];
        await cassandraClient.execute(cql_query, params, { prepare: true });
    } catch (error) {
        console.error("Error inserting into the database: ", error);
        throw new Error("Database insertion failed");
    }
}

export async function POST(request: Request) {
    try {
        let { user_id, formRole, formEmail } = await request.json();
        
        if (!user_id) {
            user_id = uuidv4();
        }
      
        await createUserInCQLDatabase(user_id, formRole, formEmail);

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error during user creation: ", error);
        return NextResponse.json({ message: "User creation failed", error: error.message }, { status: 500 });
    }
}
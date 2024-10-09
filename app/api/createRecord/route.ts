import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import getCassandraClient from "../../../lib/db";

async function insertUserIntoCQLDatabase(question_id: number, query: string, instruction: string, system: string) {
    try {
        const cassandraClient = await getCassandraClient();
        const cql_query = `
            INSERT INTO default_namespace.question_instruction (question_id, instruction, query, system)
            VALUES (?, ?, ?, ?)
        `;
        const params = [question_id, instruction, query, system];
        await cassandraClient.execute(cql_query, params, { prepare: true });
    } catch (error) {
        console.error("Error inserting into the database: ", error);
        throw new Error("Database insertion failed");
    }
}

export async function POST(request: Request) {
    try {
        const { formQuestion, formQuery, formInstruction, formSystem } = await request.json();

        const uuid = uuidv4();
        const question_id = Math.abs(parseInt(uuid.replace(/-/g, "").slice(0, 8), 16) % 2147483647);
        await insertUserIntoCQLDatabase(question_id, formQuery, formInstruction, formSystem);

        return NextResponse.json({ message: "Record Creation successful" }, { status: 201 });
    } catch (error) {
        console.error("Error during Record Creation: ", error);
        return NextResponse.json({ message: "Record Creation failed", error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import getCassandraClient from "../../../lib/db";

async function fetchRecordsFromCQLDatabase(limit: number) {
    try {
        const cassandraClient = await getCassandraClient();
        const cql_query = `
            SELECT * FROM default_namespace.question_instruction LIMIT ?
        `;
        const result = await cassandraClient.execute(cql_query, [limit], { prepare: true });

        return result.rows;
    } catch (error) {
        console.error("Error fetching from the database: ", error);
        throw new Error("Database fetch failed");
    }
}

export async function GET() {
    try {
        const records = await fetchRecordsFromCQLDatabase(20);
        return NextResponse.json({ message: "Records fetched successfully", data: records }, { status: 200 });
    } catch (error) {
        console.error("Error during fetching records: ", error);
        return NextResponse.json({ message: "Record fetching failed", error: error.message }, { status: 500 });
    }
}

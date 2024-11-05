import { NextResponse } from "next/server";
import getCassandraClient from "../../../lib/db";
import getCassandraDataCollection from "../../../lib/datadb";

async function deleteUserFromCQLDatabase(question_id: number) {
    try {
        const cassandraClient = await getCassandraClient();
        const cql_query = `
            DELETE FROM default_namespace.question_instruction WHERE question_id = ?
        `;
        await cassandraClient.execute(cql_query, [question_id], { prepare: true });
    } catch (error) {
        console.error("Error deleting from the database: ", error);
        throw new Error("Database deletion failed");
    }
}
async function deleteRecordFromVectorCollection(question_id: number) {
    try {
        const collection = await getCassandraDataCollection();
        // note that we can't add the question/text to this update unless we also update the vector
        await collection.findOneAndDelete({ question_id: question_id});
    }
    catch (error) {
        console.error("Error inserting into the database: ", error);
        throw new Error("Database insertion failed");
    }
}

export async function DELETE(request: Request) {
    try {
        const { question_id } = await request.json();

        // Ensure question_id is provided
        if (!question_id) {
            return NextResponse.json({ message: "question_id is required" }, { status: 400 });
        }

        await deleteRecordFromVectorCollection(question_id);

        return NextResponse.json({ message: "Record deletion successful" }, { status: 200 });
    } catch (error) {
        console.error("Error during Record Deletion: ", error);
        return NextResponse.json({ message: "Record Deletion failed", error: error.message }, { status: 500 });
    }
}

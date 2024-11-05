import { NextResponse } from "next/server";
import getCassandraClient from "../../../lib/db";
import getCassandraDataClient from "../../../lib/datadb";
import getCassandraDataCollection from "../../../lib/datadb";

async function updateQuestionInCQLDatabase(question_id: number, query: string, instruction: string, system: string) {
    try {
        const cassandraClient = await getCassandraClient();
        const cql_query = `
            UPDATE default_namespace.question_instruction
            SET instruction = ?, query = ?, system = ?
            WHERE question_id = ?
        `;
        const params = [instruction, query, system, question_id];
        await cassandraClient.execute(cql_query, params, { prepare: true });
    } catch (error) {
        console.error("Error updating the database: ", error);
        throw new Error("Database update failed");
    }
}
async function updateQuestionInVectorDatabase(question_id: number, query: string, instruction: string, system: string) {
    // note that we can't add the question/text to this update unless we also update the vector
    try {
        const collection = await getCassandraDataCollection();
        const docBefore = await collection.findOneAndUpdate(
            { question_id: question_id },
            { $set: { instruction: instruction, query: query, system: system } },
          );
        
    } catch (error) {
        console.error("Error updating the vector database: ", error);
        throw new Error("Database update failed");
    }
}

export async function POST(request: Request) {
    try {
        const { question_id, formQuestion, formQuery, formInstruction, formSystem } = await request.json();
        //await updateQuestionInCQLDatabase(question_id, formQuery, formInstruction, formSystem);
        await updateQuestionInVectorDatabase(question_id, formQuery, formInstruction, formSystem);

        return NextResponse.json({ message: "Record Updated successful" }, { status: 201 });
    } catch (error) {
        console.error("Error during Record Updation: ", error);
        return NextResponse.json({ message: "Record Update failed", error: error.message }, { status: 500 });
    }
}

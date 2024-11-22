import { NextResponse } from "next/server";

import getCassandraDataCollection from "../../../lib/datadb";

async function updateQuestionInVectorDatabase(question_id: number, query: string, instruction: string, system: string) {
    // note that we can't add the question/text to this update unless we also update the vector
    try {
        const collection = await getCassandraDataCollection();
        const docBefore = await collection.findOneAndUpdate(
            { "metadata.question_id": question_id },
            { $set: { "metadata.instruction": instruction, "metadata.query": query, "metadata.system": system } },
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

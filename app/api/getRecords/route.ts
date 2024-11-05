import { NextResponse } from "next/server";
import getCassandraDataCollection from "../../../lib/datadb";

async function getRecordsInVectorDatabase() {
    // note that we can't add the question/text to this update unless we also update the vector
    try {
        const collection = await getCassandraDataCollection();
        const docBefore = await collection.find({ });
        return docBefore;
        
    } catch (error) {
        console.error("Error updating the vector database: ", error);
        throw new Error("Database update failed");
    }
}

export async function GET() {
    try {
        const records = await getRecordsInVectorDatabase();
        return NextResponse.json(
            { message: "Records fetched successfully", data: records }, 
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during fetching records: ", error);
        return NextResponse.json(
            { message: "Record fetching failed", error: error.message }, 
            { status: 500 }
        );
    }
}

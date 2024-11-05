import { v4 as uuidv4 } from "uuid";
import getCassandraClient from "../../../lib/db";
import getCassandraDataCollection from "../../../lib/datadb";
import { NextRequest, NextResponse } from "next/server";
import { LangflowClient } from "../../../utils/langflowClient";
import { tweaks } from "../../../utils/consts";
import exp from "constants";
import { getServerSession } from "next-auth";
import authOptions from "../../../utils/authOptions";

async function insertRecordIntoVectorCollection(question_id: string, query: string, instruction: string, system: string, question: string, session_id: string) {
    try {
        // Invoke a LangFlow flow for creating the vector
        // (Start with the example in /api/langflow/route.ts)

        const endpoint = process.env.CASSANDRA_DATA_ENDPOINT || "";

        const langflowClient = new LangflowClient({
            baseURL: process.env.LANGFLOW_BASE_URL || "",
            applicationToken: process.env.LANGFLOW_APPLICATION_TOKEN || "",
        });
        const flowIdOrName = process.env.INGEST_FLOW_NAME || "";
        const langflowId = process.env.LANGFLOW_ID || "";
        const tweaks = {
            "ChatInput-vTFel": {
              "files": "",
              "sender": "User",
              "sender_name": "User",
              "session_id": session_id,
              "should_store_message": true
            },
            "CustomComponent-79dKv": {
              "input_value": ""
            },
            "HuggingFaceInferenceAPIEmbeddings-B9hkI": {
              "model_path": "HUGGINGFACE_MODEL_PATH"
            },
            "HCD-F747C": {
              "api_endpoint": "CASSANDRA_DATA_ENDPOINT",
              "batch_size": null,
              "bulk_delete_concurrency": null,
              "bulk_insert_batch_concurrency": null,
              "bulk_insert_overwrite_concurrency": null,
              "ca_certificate": "",
              "collection_indexing_policy": "",
              "collection_name": "CASSANDRA_COLLECTION",
              "metadata_indexing_exclude": "",
              "metadata_indexing_include": "",
              "metric": "",
              "namespace": "default_namespace",
              "number_of_results": 4,
              "password": "CASSANDRA_PASSWORD",
              "pre_delete_collection": false,
              "search_filter": {},
              "search_input": "",
              "search_score_threshold": 0,
              "search_type": "Similarity",
              "setup_mode": "Sync",
              "username": "CASSANDRA_USERNAME"
            },
            "TransformData-HEVKG": {}
          };
          try {
            const response = await langflowClient.runFlow(
                    flowIdOrName,
                    //langflowId: string,
                    JSON.stringify({ question_id, query, instruction, system, question }), 
                    "chat",
                    "chat",
                    session_id,
                    tweaks,
                    false,
                );
      
                return response;
        } catch (error) {
            console.error('Main Error:', error.message);
        }
      } catch (error) {
        console.error("Error inserting into the database: ", error);
        throw new Error("Database insertion failed");
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
        }
        const session_id = session.user.email || "No email provided";

        const { formQuestion, formQuery, formInstruction, formSystem } = await req.json();
        await insertRecordIntoVectorCollection(uuidv4(), formQuery, formInstruction, formSystem, formQuestion, session_id);

        return NextResponse.json({ message: "Record created successfully" });
    } catch (error) {
        console.error("Error during Record Creation: ", error);
        return NextResponse.json({ message: "Record Creation failed", error: error.message }, { status: 500 });
    }
}

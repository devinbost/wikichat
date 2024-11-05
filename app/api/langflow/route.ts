import { NextRequest, NextResponse } from "next/server";
import { LangflowClient } from "../../../utils/langflowClient";
import { tweaks } from "../../../utils/consts";

// Define the characters for Base62 encoding
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Convert an integer to a Base62 string
function encodeBase62(num: number): string {
    let result = "";
    while (num > 0) {
        result = BASE62[num % 62] + result;
        num = Math.floor(num / 62);
    }
    return result;
}

// Convert a Base62 string back to an integer (for reversibility)
function decodeBase62(str: string): number {
    let num = 0;
    for (let i = 0; i < str.length; i++) {
        num = num * 62 + BASE62.indexOf(str[i]);
    }
    return num;
}

// Function to pad the Base62 string to resemble a UUID
function padToUUID(base62Str: string): string {
    // Pad or truncate the Base62 string to match UUID length
    const paddedStr = base62Str.padStart(32, "0"); // Ensure it's 32 characters long
    return paddedStr.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, "$1-$2-$3-$4-$5");
}

// Function to hash the session ID using SHA-256 and return a Base62 UUID-like string
function hashSessionId(sessionId) {
    const intRepresentation = parseInt(sessionId); // Convert part of the hash to an integer
    const base62Str = encodeBase62(intRepresentation);
    return padToUUID(base62Str); // Return a UUID-like Base62 encoded string
}

export async function POST(req: NextRequest) {
    try {
        const { inputValue, inputType, outputType, session_id, stream } = await req.json();

        const langflowClient = new LangflowClient({
            baseURL: process.env.LANGFLOW_BASE_URL || "",
            applicationToken: process.env.LANGFLOW_APPLICATION_TOKEN || "",
        });
        const flowIdOrName = process.env.SEARCH_FLOW_NAME || "";
        const langflowId = process.env.LANGFLOW_ID || "";
        const UUID_SessionId = hashSessionId(session_id);
        console.log("🚀 ~ POST ~ UUID_SessionId:", UUID_SessionId);
        const tweaks = {
          "ChatInput-RjY7v": {
            "files": "",
            "sender": "User",
            "sender_name": "User",
            "session_id": UUID_SessionId,
            "should_store_message": true
          },
          "Memory-UvXdS": {
            "n_messages": 100,
            "order": "Ascending",
            "sender": "Machine and User",
            "sender_name": "",
            "session_id": UUID_SessionId,
            "template": "{sender_name}: {text}"
          },
          "CustomComponent-pemtq": {
            "input_value": ""
          },
          "ParseData-WGKsE": {
            "sep": "\n",
            "template": "{user_question}"
          },
          "ParseData-5sZ05": {},
          "CustomComponent-zcsC3": {},
          "CustomComponent-ZauAh": {
            "DB_ID": "ASTRA_DB_DATABASE_ID",
            "DB_TOKEN": "ASTRA_DB_TOKEN"
          },
          "CustomComponent-PBC8l": {},
          "Prompt-WQy1S": {
            "template": "You're helping a customer support agent with a customer. Please answer the customer's question based ONLY on the provided data and instructions (for interpreting the data) below. Please use the instructions in the JSON below to interpret the data. If the data retrieved is NULL for a field expected to exist to answer the question, say the data doesn't exist for that question. Otherwise, if you don't know the answer based on the available information, just say you don't know. Also, don't answer questions you've already answered in the previous chat context. \n\nCustomer question - THIS is the question you need to answer:\n\n{user_question}\n\n\n\n\nData and instructions:\n\n{rows}\n\n\n\n\n\nPrevious chat context - don't answer these questions:\n\n\n{chat_history}",
            "rows": "",
            "user_question": "",
            "chat_history": ""
          },
          "ParseData-ojkQ4": {
            "sep": "\n",
            "template": "{rows}"
          },
          "ParseData-MKMlW": {
            "sep": "\n",
            "template": "{user_question}"
          },
          "ChatOutput-YLKnt": {
            "data_template": "{text}",
            "input_value": "",
            "sender": "Machine",
            "sender_name": "AI",
            "session_id": UUID_SessionId,
            "should_store_message": true
          },
          "CustomComponent-a31yV": {
            "DB_HOST": "MYSQL_HOST",
            "DB_NAME": "MYSQL_DB",
            "DB_PASSWORD": "MYSQL_PASSWORD",
            "DB_USER": "MYSQL_USER"
          },
          "CustomComponent-WSzv5": {},
          "ParseData-me0f7": {
            "sep": "\n",
            "template": "{text}"
          },
          "OllamaModel-6QliL": {
            "base_url": "OLLAMA_HOST",
            "format": "",
            "input_value": "",
            "metadata": {},
            "mirostat": "Disabled",
            "mirostat_eta": null,
            "mirostat_tau": null,
            "model_name": "llama3.1:latest",
            "num_ctx": null,
            "num_gpu": null,
            "num_thread": null,
            "repeat_last_n": null,
            "repeat_penalty": null,
            "stop_tokens": "",
            "stream": false,
            "system": "",
            "system_message": "",
            "tags": "",
            "temperature": 0.2,
            "template": "",
            "tfs_z": null,
            "timeout": null,
            "top_k": null,
            "top_p": null,
            "verbose": false
          },
          "HuggingFaceInferenceAPIEmbeddings-cKkul": {
            "model_path": "HUGGINGFACE_MODEL_PATH"
          },
          "HCD-wM3Po": {
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
          "APIRequest-KSAJk": {
            "api_key": "REST_API_KEY",
            "curl": "",
            "lsl_key": "REST_LSL_KEY",
            "method": "POST",
            "timeout": 5,
            "url": "REST_ENDPOINT"
          },
          "TransformData-AFmuc": {}
        };
            if (stream) {
                // Initiate the session and get the stream URL
                const initResponse = await langflowClient.initiateSession(
                    flowIdOrName,
                    inputValue,
                    inputType,
                    outputType,
                    UUID_SessionId,
                    tweaks,
                    stream,
                );
    
                const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
                const fullStreamUrl = `${process.env.LANGFLOW_BASE_URL}${streamUrl}?session_id=${UUID_SessionId}`;
    
                // Fetch the streaming response from LangFlow
                const responseStream = await fetch(fullStreamUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${process.env.LANGFLOW_APPLICATION_TOKEN || ''}`,
                        // Any other headers required
                    },
                });
    
                if (!responseStream.ok || !responseStream.body) {
                    throw new Error(`Failed to fetch stream: ${responseStream.statusText}`);
                }
    
                // Return the streaming response to the client
                return new NextResponse(responseStream.body, {
                    headers: {
                        'Content-Type': 'text/event-stream',
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive',
                    },
                });
            } else {
                // Non-streaming response
                const response = await langflowClient.runFlow(
                    flowIdOrName,
                    inputValue,
                    inputType,
                    outputType,
                    UUID_SessionId,
                    tweaks,
                    stream,
                );
                return NextResponse.json(response);
            }
        } catch (error) {
            console.error("Error running flow:", error);
            return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
        }
}

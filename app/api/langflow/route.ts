import { NextRequest, NextResponse } from "next/server";
import { LangflowClient } from "../../../utils/langflowClient";

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
            "ChatInput-PeRl9": {
              "files": "",
              "background_color": "",
              "chat_icon": "",
              "sender": "User",
              "sender_name": "User",
              "session_id": UUID_SessionId,
              "should_store_message": true,
              "text_color": ""
            },
            "Prompt-4SA8R": {
                  "input_value": ""
            },
            "Prompt-vxAse": {
                    "sep": "\n",
                    "template": "{customer_question}"
            },
            "Prompt-nZuJ3": {},
            "Prompt-nBaOu": {},
            "Prompt-YSOkS": {},
            "Prompt-rmPYT": {
                    "api_key": "REST_API_KEY",
                    "curl": "",
                    "lsl_key": "REST_LSL_KEY",
                    "method": "POST",
                    "timeout": 5,
                    "url": "REST_ENDPOINT"
            },
            "Prompt-BZ5Mz": {},
            "Prompt-s6Oo2": {
                    "sep": "\n",
                    "template": "{rows}"
            },
            "Prompt-eQQHx": {
                    "sep": "\n",
                    "template": "{instruction_list}"
            },
            "Prompt-NtFVj": {
                    "template": "You're helping a customer support agent with a customer. Please answer the customer's question based ONLY on the provided data and instructions (for interpreting the data) below. Please use the Instructions in the JSON below to interpret the data. If the data retrieved is NULL for a field expected to exist to answer the question, say the data doesn't exist for that question. Otherwise, if you don't know the answer based on the available information, just say you don't know. Also, just answer the Customer Question. \n\nCustomer Question - THIS is the question you need to answer:\n\n{customer_question}\n\n\n\n\nHere are the Instructions for interpreting the data:\n\n{instructions}\n\n\n\n\nHere are the data:\n\n{rows}\n\n\n\n\n\nPrevious chat context:\n\n\n{chat_history}",
                    "tool_placeholder": "",
                    "customer_question": "",
                    "instructions": "",
                    "rows": "",
                    "chat_history": ""
            },
            "Prompt-eVxor": {
                    "sep": "\n",
                    "template": "{customer_question}"
            },
            "NVIDIAModelComponent-pWlFg": {
                    "base_url": "NVIDIA_LLM_ENDPOINT",
                    "input_value": "",
                    "max_tokens": null,
                    "model_name": "NVIDIA_LLM_MODEL",
                    "nvidia_api_key": "",
                    "seed": 1,
                    "stream": false,
                    "system_message": "",
                    "temperature": 0.1
            },
            "ChatOutput-3vnut": {
                    "background_color": "",
                    "chat_icon": "",
                    "data_template": "{text}",
                    "input_value": "",
                    "sender": "Machine",
                    "sender_name": "AI",
                    "session_id": UUID_SessionId,
                    "should_store_message": true,
                    "text_color": ""
            },
            "Memory-QlyoJ": {
              "n_messages": 100,
              "order": "Ascending",
              "sender": "Machine and User",
              "sender_name": "",
              "session_id": UUID_SessionId,
              "template": "{sender_name}: {text}"
            },
            "Memory-8qn8a": {},
            "Memory-jByDU": {
                    "sep": "\n",
                    "template": "{text}"
            },
            "HCD-k6Yxl": {
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
                    "search_query": "",
                    "search_score_threshold": 0,
                    "search_type": "Similarity",
                    "setup_mode": "Sync",
                    "username": "CASSANDRA_USERNAME"
            },
            "NVIDIAEmbeddingsComponent-zavH7": {
                    "base_url": "NVIDIA_EMBEDDING_ENDPOINT",
                    "model": "NVIDIA_EMBEDDING_MODEL",
                    "nvidia_api_key": "",
                    "temperature": 0.1
            },
            "Prompt-igPHB": {
              "api_endpoint": "CASSANDRA_DATA_ENDPOINT",
              "collection_name": "CASSANDRA_COLLECTION",
              "input": "",
              "nvidia_embedding_endpoint": "NVIDIA_EMBEDDING_ENDPOINT",
              "password": "CASSANDRA_PASSWORD",
              "username": "CASSANDRA_USERNAME"
            },
        }; //"NVIDIA_MODEL_ENDPOINT",//"NVIDIA_EMBEDDING_ENDPOINT",
        if (stream) {
          // === STREAMING LOGIC ===
          // 1) Directly ask for streaming
          const responseStream = await langflowClient.initiateSessionStream(
            flowIdOrName,
            inputValue,
            inputType,
            outputType,
            UUID_SessionId,
            tweaks,
            true  // pass `stream = true` 
          );
    
          if (!responseStream.ok || !responseStream.body) {
            throw new Error(`Failed to fetch stream: ${responseStream.statusText}`);
          }
    
          // 2) Forward raw ND-JSON lines to the client
          return new NextResponse(responseStream.body, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              "Connection": "keep-alive",
            },
          });
        } else {
          // === NON-STREAMING LOGIC ===
          const response = await langflowClient.runFlow(
            flowIdOrName,
            inputValue,
            inputType,
            outputType,
            UUID_SessionId,
            tweaks,
            false  // no stream
          );
          console.log("🚀 ~ POST non-stream ~ response:", response);
          return NextResponse.json(response);
        }
      } catch (error) {
        console.error("Error running flow:", error);
        return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
      }
    }

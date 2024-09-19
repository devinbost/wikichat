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
    const paddedStr = base62Str.padStart(32, "0"); // Ensure it’s 32 characters long
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
        const { inputValue, inputType, outputType, stream } = await req.json();

        const langflowClient = new LangflowClient({
            baseURL: process.env.LANGFLOW_BASE_URL || "",
            applicationToken: process.env.LANGFLOW_APPLICATION_TOKEN || "",
        });
        const flowIdOrName = process.env.FLOW_ID_OR_NAME || "";
        const langflowId = process.env.LANGFLOW_ID || "";
        const response = await langflowClient.runFlow(
            flowIdOrName,
            inputValue || '{"initialInvocation": "true", "input": "8888888888"}',
            inputType || "chat",
            outputType || "chat",
            {},
            stream,
        );
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error running flow: in langflow api route", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

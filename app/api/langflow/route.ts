import { NextRequest, NextResponse } from "next/server";
import { LangflowClient } from "../../../utils/langflowClient";

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
            langflowId,
            inputValue || "hello",
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

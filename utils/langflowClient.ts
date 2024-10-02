// utils/client.ts
export interface LangflowClientConfig {
    baseURL: string;
    applicationToken: string;
}

export class LangflowClient {
    private baseURL: string;
    private applicationToken: string;

    constructor(config: LangflowClientConfig) {
        this.baseURL = config.baseURL;
        this.applicationToken = config.applicationToken;
    }

    private async post(
        endpoint: string,
        body: any,
        headers: Record<string, string> = { "Content-Type": "application/json" },
    ): Promise<any> {
        headers["Authorization"] = `Bearer ${this.applicationToken}`;
        const url = `${this.baseURL}${endpoint}`;
        // Log the request details
        console.log("POST Request:", {
            url,
            headers,
            body,
        });
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(body),
            });

            const responseMessage = await response.json();
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
            }
            return responseMessage;
        } catch (error) {
            console.error("Request Error:", (error as Error).message);
            throw error;
        }
    }

    public async initiateSession(
        flowId: string,
        //langflowId: string,
        inputValue: string,
        inputType: string = "chat",
        outputType: string = "chat",
        session_id: string,
        tweaks: Record<string, any> = {},
        stream: boolean = false,
    ): Promise<any> {
        console.log("InitiateSession Parameters:", {
            flowId,
            inputValue,
            inputType,
            outputType,
            session_id,
            tweaks,
            stream,
        });
        // const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
        const endpoint = `/api/v1/run/${flowId}?stream=${stream}`;
        return this.post(endpoint, {
            input_value: inputValue,
            input_type: inputType,
            output_type: outputType,
            session_id: session_id,
            tweaks: tweaks,
        });
    }

    public async runFlow(
        flowIdOrName: string,
        //langflowId: string,
        inputValue: string,
        inputType: string = "chat",
        outputType: string = "chat",
        session_id: string,
        tweaks: Record<string, any> = {},
        stream: boolean = false,
    ): Promise<any | undefined> {
        try {
            const initResponse = await this.initiateSession(
                flowIdOrName,
                //langflowId,
                inputValue,
                inputType,
                outputType,
                session_id,
                tweaks,
                stream,
            );

            if (stream && initResponse?.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url) {
                const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
                //this.handleStream(streamUrl, onUpdate, onClose, onError);
                console.log("Stream URL:", streamUrl);

                return { streamUrl };
            } else if (!stream && initResponse && initResponse.outputs) {
                const flowOutputs = initResponse.outputs[0];
                const firstComponentOutputs = flowOutputs.outputs[0];
                const output = firstComponentOutputs.outputs.message;
                return output;
            }
        } catch (error) {
            console.error("Error running flow: in langflow client", error);
            throw error;
        }
    }
}

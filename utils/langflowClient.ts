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
            const responseMessage = await response.text();
            console.log("Raw response from server:", responseMessage);

            //const responseMessage = await response.json();
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
            console.log("InitiateSession Response:", initResponse);
            if (stream && initResponse?.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url) {
                console.log("Stream URL:", initResponse.outputs[0].outputs[0].artifacts.stream_url);
                const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
                //this.handleStream(streamUrl, onUpdate, onClose, onError);
                console.log("Stream URL:", streamUrl);

                return { streamUrl };
            } else if (!stream && initResponse && initResponse.outputs) {
                console.log("Flow Outputs:", initResponse.outputs);
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
    // This helper returns a raw Response object
    private async postStream(
        endpoint: string,
        body: any
    ): Promise<Response> {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.applicationToken}`,
        };

        console.log("POST Stream Request:", {
            url,
            headers,
            body,
        });

        // IMPORTANT: We do *not* call .json() or .text() here
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });

        // We'll let the caller handle streaming the response,
        // so just return the raw fetch Response.
        return response;
    }
    /**
     * Stream-initiation version:
     * Directly returns the fetch Response (for ND-JSON streaming).
     */
    public async initiateSessionStream(
        flowId: string,
        inputValue: string,
        inputType: string = "chat",
        outputType: string = "chat",
        session_id: string,
        tweaks: Record<string, any> = {},
        stream: boolean = false
    ): Promise<Response> {
        console.log("InitiateSessionStream Parameters:", {
            flowId,
            inputValue,
            inputType,
            outputType,
            session_id,
            tweaks,
            stream,
        });
        const endpoint = `/api/v1/run/${flowId}?stream=${stream}`;
        return this.postStream(endpoint, {
            input_value: inputValue,
            input_type: inputType,
            output_type: outputType,
            session_id,
            tweaks,
        });
    }

    /**
     * Non-streaming version:
     * Re-uses your existing `post(...)` which does await response.text() or .json().
     */
    public async runFlow(
        flowIdOrName: string,
        inputValue: string,
        inputType: string,
        outputType: string,
        session_id: string,
        tweaks: Record<string, any>,
        stream: boolean
    ): Promise<any> {
        // This calls your existing initiateSession => post => parse text
        // If you want to unify code, that’s fine, but be aware
        // your "this.post()" is not for streaming. 
        // We'll keep it as-is for the non-stream scenario.
        const initResponse = await this.post(
            `/api/v1/run/${flowIdOrName}?stream=${stream}`,
            {
                input_value: inputValue,
                input_type: inputType,
                output_type: outputType,
                session_id,
                tweaks,
            }
        );
        // initResponse is a string from response.text()
        // If it’s valid JSON, parse it:
        const parsed = JSON.parse(initResponse);
        return parsed;
    }
}

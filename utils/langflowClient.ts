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
        stream: boolean = false,
        tweaks: Record<string, any> = {},
    ): Promise<any> {
        // const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
        const endpoint = `/api/v1/run/${flowId}?stream=${stream}`;
        return this.post(endpoint, {
            input_value: inputValue,
            input_type: inputType,
            output_type: outputType,
            tweaks: tweaks,
        });
    }

    public async runFlow(
        flowIdOrName: string,
        //langflowId: string,
        inputValue: string,
        inputType: string = "chat",
        outputType: string = "chat",
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
                stream,
                tweaks,
            );

            if (stream && initResponse?.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url) {
                const streamUrl = initResponse.outputs[0].outputs[0].artifacts.stream_url;
                console.log("🚀 ~ LangflowClient ~ streamUrl:", streamUrl);

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

export interface LLMConfig {
    provider: "openai" | "langchain" | "langgraph";
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface LLMResponse {
    success: boolean;
    message: string;
    error?: Error;
    result?: {
        text: string;
        tokens: number;
        metadata?: Record<string, any>;
    };
}

export interface LLMRequest {
    text: string;
    config?: Partial<LLMConfig>;
    context?: Record<string, any>;
}

import { LLMConfig, LLMRequest, LLMResponse } from "../types";

/**
 * Base class for LLM service implementations
 */
export abstract class BaseLLMService {
    protected config: LLMConfig;

    constructor(config: LLMConfig) {
        this.config = config;
    }

    /**
     * Process text using the LLM
     * @param {LLMRequest} request - The request to process
     * @returns {Promise<LLMResponse>} The LLM response
     */
    abstract process(request: LLMRequest): Promise<LLMResponse>;

    /**
     * Initialize the service
     * @returns {Promise<boolean>} Success status
     */
    abstract initialize(): Promise<boolean>;

    /**
     * Validate configuration
     * @returns {boolean} Is configuration valid
     */
    protected validateConfig(): boolean {
        return Boolean(
            this.config &&
            this.config.provider &&
            this.config.apiKey
        );
    }

    /**
     * Create error response
     * @param {Error | string} error - The error
     * @returns {LLMResponse} Error response
     */
    protected createErrorResponse(error: Error | string): LLMResponse {
        const errorObj = error instanceof Error ? error : new Error(error);
        return {
            success: false,
            message: errorObj.message,
            error: errorObj
        };
    }

    /**
     * Create success response
     * @param {string} text - The result text
     * @param {number} tokens - Token count
     * @param {Record<string, any>} metadata - Additional metadata
     * @returns {LLMResponse} Success response
     */
    protected createSuccessResponse(
        text: string,
        tokens: number,
        metadata?: Record<string, any>
    ): LLMResponse {
        return {
            success: true,
            message: "Successfully processed request",
            result: {
                text,
                tokens,
                metadata
            }
        };
    }
}

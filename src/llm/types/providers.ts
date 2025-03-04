export const LLMProviders = {
    OPENAI: "OpenAI",
    ANTHROPIC: "Anthropic",
    GOOGLE_AI: "Google AI",
    COHERE: "Cohere"
} as const;

export type LLMProviderName = typeof LLMProviders[keyof typeof LLMProviders];

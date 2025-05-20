export const LLMProviders = {
    OPENAI: "OpenAI",
    ANTHROPIC: "Anthropic",
    GOOGLE_AI: "Google AI",
    OLLAMA: "Ollama"
} as const;

export type LLMProviderName = typeof LLMProviders[keyof typeof LLMProviders];

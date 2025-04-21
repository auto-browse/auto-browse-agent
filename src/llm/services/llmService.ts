import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { storageService } from "@/storage/services/storageService";
import { Settings, OllamaSettings } from "@/storage/types/settings";
import { LLMProviders } from "../types/providers";

export interface LLMOptions {
    streaming?: boolean;
    temperature?: number;
}

export async function createLLM(options: LLMOptions = { streaming: true, temperature: 0 }) {
    const response = await storageService.getData("settings");
    if (!response.success || !response.data)
    {
        throw new Error('Failed to load settings');
    }

    const settings = response.data as Settings;
    const provider = settings.providers.find(p => p.provider === settings.selectedProvider);

    if (!provider)
    {
        throw new Error(`Provider ${settings.selectedProvider} not configured`);
    }

    switch (settings.selectedProvider)
    {
        case LLMProviders.ANTHROPIC:
            return new ChatAnthropic({
                anthropicApiKey: provider.settings.key,
                modelName: provider.settings.model,
                ...options
            });

        case LLMProviders.GOOGLE_AI:
            return new ChatGoogleGenerativeAI({
                apiKey: provider.settings.key,
                model: provider.settings.model,
                ...options
            });

        case LLMProviders.OLLAMA:
            const ollamaSettings = provider.settings as OllamaSettings;
            return new ChatOllama({
                model: ollamaSettings.model,
                baseUrl: ollamaSettings.baseUrl,
                ...options
            });

        default: // OpenAI
            return new ChatOpenAI({
                openAIApiKey: provider.settings.key,
                modelName: provider.settings.model,
                ...options
            });
    }
}

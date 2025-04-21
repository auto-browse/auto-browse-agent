import { ChatOpenAI } from "@langchain/openai";
import { storageService } from "@/storage/services/storageService";
import { Settings } from "@/storage/types/settings";
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
    const openAIKey = settings.apiKeys.find(
        key => key.provider.toLowerCase() === LLMProviders.OPENAI.toLowerCase()
    )?.key;

    if (!openAIKey)
    {
        throw new Error('OpenAI API key not configured');
    }

    return new ChatOpenAI({
        openAIApiKey: openAIKey,
        modelName: "gpt-4o-mini",
        ...options
    });
}

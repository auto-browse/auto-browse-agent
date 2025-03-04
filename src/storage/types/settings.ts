import { LLMProviderName } from "@/llm/types/providers";

export interface ApiKey {
    provider: LLMProviderName;
    key: string;
}

export interface Settings {
    selectedProvider: LLMProviderName;
    apiKeys: ApiKey[];
}

export interface StorageKey {
    key: "settings";
    data: Settings;
}

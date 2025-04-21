import { LLMProviderName } from "@/llm/types/providers";

export interface BaseProviderSettings {
    key: string;
    model: string;
}

export interface OllamaSettings extends BaseProviderSettings {
    baseUrl: string;
}

export interface ProviderSettings {
    provider: LLMProviderName;
    settings: OllamaSettings | BaseProviderSettings;
}

export interface Settings {
    selectedProvider: LLMProviderName;
    providers: ProviderSettings[];
}

export interface StorageKey {
    key: "settings";
    data: Settings;
}

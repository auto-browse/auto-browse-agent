export interface ApiKey {
    provider: string;
    key: string;
}

export interface Settings {
    selectedProvider: string;
    apiKeys: ApiKey[];
}

export interface StorageKey {
    key: "settings";
    data: Settings;
}

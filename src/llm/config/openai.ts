import { ChatOpenAI } from "@langchain/openai";
import { storageService } from "@/storage/services/storageService";
import { ApiKey } from "@/storage/types/settings";

export async function getOpenAIChat(): Promise<ChatOpenAI> {
    const settingsResponse = await storageService.getData("settings");
    console.log("Settings response:", settingsResponse); // Debug log

    if (!settingsResponse.success || !settingsResponse.data)
    {
        throw new Error("Failed to get OpenAI settings");
    }

    const { apiKeys } = settingsResponse.data;
    console.log("Available providers:", apiKeys.map((k: ApiKey) => k.provider)); // Debug log

    const apiKey = apiKeys.find((key: ApiKey) => key.provider === "openai")?.key;

    if (!apiKey)
    {
        throw new Error("OpenAI API key not found in settings. Please add your API key in the extension options.");
    }

    return new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: "gpt-4-turbo-preview",
        temperature: 0,
        streaming: true
    });
}

import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createBrowserTools } from "../tools/browser/browserTools";
import { storageService } from "@/storage/services/storageService";
import { Settings } from "@/storage/types/settings";
import { LLMProviders } from "../types/providers";
import { browserService } from "@/browser/services/browserService";

export async function createAgent() {
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

    const model = new ChatOpenAI({
        openAIApiKey: openAIKey,
        modelName: "gpt-4o-mini",
        temperature: 0,
        streaming: true
    });

    const browserTools = createBrowserTools();
    const llmWithTools = model.bindTools(browserTools, { parallel_tool_calls: false });
    const accessibilitySnapshot = await browserService.getAccessibilitySnapshot();
    const accessibilityData = accessibilitySnapshot.success ? accessibilitySnapshot.data.snapshot : 'No accessibility data available';
    const formattedMap = await browserService.getFormattedInteractiveMap();
    const formattedMapData = formattedMap.success ? formattedMap.data.elements : 'No formatted map data available';

    const formattedMapString = Array.isArray(formattedMapData)
        ? formattedMapData.map(element => element.formattedOutput).join('\n')
        : 'No formatted map data available';

    const customPrompt = `You are a helpful assistant that can browse the web. Use the accessibility snapshot and formatted interactive map to come up with a puppeteer selector which you can pass to call the required tools to complete the user requested action. Here Current page accessibility snapshot: ${JSON.stringify(accessibilityData)}. Current page formatted interactive map:
${formattedMapString}`;

    console.log(customPrompt);

    return await createReactAgent({
        llm: llmWithTools,
        tools: browserTools,
        prompt: customPrompt
    });
}

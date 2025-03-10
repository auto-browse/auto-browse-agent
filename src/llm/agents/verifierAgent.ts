import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { storageService } from "@/storage/services/storageService";
import { browserService } from "@/browser/services/browserService";
import { Settings } from "@/storage/types/settings";
import { LLMProviders } from "../types/providers";

export async function createVerifierAgent() {
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

    const accessibilitySnapshot = await browserService.getAccessibilitySnapshot();
    const accessibilityData = accessibilitySnapshot.success ? accessibilitySnapshot.data.snapshot : 'No accessibility data available';
    const formattedMap = await browserService.getFormattedInteractiveMap();
    const formattedMapData = formattedMap.success ? formattedMap.data.elements : 'No formatted map data available';

    const formattedMapString = Array.isArray(formattedMapData)
        ? formattedMapData.map(element => element.formattedOutput).join('\n')
        : 'No formatted map data available';

    const verifierPrompt = `You are a plan execution verifier. Your job is to analyze if a planned action was successfully executed based on the current page state.

Planned Action: {planString}
Action Result: {reactresult}

Current Page State:
Accessibility Snapshot: ${JSON.stringify(accessibilityData)}
Formatted Interactive Map:
${formattedMapString}

Analyze the plan, its result, and the current page state to determine if the action was successfully completed.
If successful, explain what indicates success.
If not successful, explain what's missing or what went wrong.`;

    return await createReactAgent({
        llm: model,
        tools: [],
        stateModifier: verifierPrompt
    });
}

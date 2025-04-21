import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createBrowserTools } from "../tools/browser/browserTools";
import { storageService } from "@/storage/services/storageService";
import { Settings } from "@/storage/types/settings";
import { LLMProviders } from "../types/providers";
import { browserStateService } from "@/browser/services/browserStateService";

export const BrowserResponseSchema = {
    type: "object",
    properties: {
        action_result: {
            type: "string",
            description: "The result of action that was performed"
        }
    },
    required: ["action_result"]
};

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
    const browserState = await browserStateService.getBrowserState();
    const stateMessage = browserState.success ? browserState.message : 'Failed to get browser state';

    const customPrompt = `You are a helpful assistant that can browse the web. Use the provided browser state information to come up with a puppeteer selector which you can pass to call the required tools to complete the user requested action.
    Always use the tools to perform the action, even if you think you can do it without them.
    Do not assume that the action is already completed. You must always perform the action using the tools.
Your task is to perform the action requested by the user. You can use the tools provided to you to do so.
Your output must be a stringified JSON object with exactly these fields:
# Example Output (when onjective is complete)
    {
    "action_result": "<final result of actions performed using the tools>"
    }

Current Browser State:
${stateMessage}`;

    console.log(customPrompt);

    return await createReactAgent({
        llm: llmWithTools,
        tools: browserTools,
        stateModifier: customPrompt,
        responseFormat: {
            prompt: `Return a stringified JSON object with exactly these fields:
            {
                "action_result": "<final result of action performed>"
            }`,
            schema: BrowserResponseSchema
        }
    });
}

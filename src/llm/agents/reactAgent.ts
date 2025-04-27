import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createBrowserTools } from "../tools/browser/browserTools"; // Reverted import
import { createLLM } from "../services/llmService";

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
    const model = await createLLM();

    // Call the factory function
    const browserTools = createBrowserTools();
    const llmWithTools = model.bindTools(browserTools, { parallel_tool_calls: false });

    const toolDescriptions = browserTools.map(tool =>
        `- ${tool.name}: ${tool.description}`
    ).join('\n');

    const customPrompt = `You are a helpful assistant that can browse the web. You need to complete user requested actions through the provided tools.

If you need to generate a locator then call the browser state tool to get the current state of the browser which has the accessibility along with ref id to help generate locator.

Available Tools:
${toolDescriptions}

Your task is to perform the action requested by the user.
Your output must be a stringified JSON object with exactly these fields:
# Example Output (when objective is complete)
    {
    "action_result": "<final result of actions performed using the tools>"
    }`;

    //console.log(customPrompt);

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

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Tool } from "@langchain/core/tools";
import snapshot from '../tools/snapshot';
import navigateTools from '../tools/navigate';
import browserState from '../tools/browserState'; // Import the new tool

import { createLangChainTool } from '../tools/tool';
import { createLLM } from "../services/llmService";

// Convert our custom tools to LangChain tools
const allTools = [
    ...navigateTools(true),
    ...snapshot,
    ...browserState, // Add the new tool to the list
].map(customTool => createLangChainTool(customTool));
const browserTools = [...allTools] as Tool[];
//const browserTools = snapshot.map(createLangChainTool) as unknown as Tool[];

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

    const llmWithTools = model.bindTools(browserTools, { parallel_tool_calls: false });



    const customPrompt = `You are a helpful assistant that can browse the web. You need to complete user requested actions by interacting with web elements through the provided tools.

IMPORTANT RULES:

1. BROWSER STATE FIRST POLICY:
   - ALWAYS begin by calling 'browser_state' to analyze the current page (URL, title, snapshot) before performing ANY action.
   - Use the state information (URL, title, snapshot) to inform your next action.
   - Do not attempt interactions without first understanding the page context via 'browser_state'.

2. SEQUENTIAL WORKFLOW:
   - Run tools one at a time in sequence
   - Wait for each tool to complete before running the next one
   - Always check the results of each tool call before proceeding

3. OBSTACLE HANDLING:
   - Always check for and handle common obstacles before proceeding with the main task:
     * Cookie consent banners or popups
     * Login prompts or authentication requirements
     * Advertisements or promotional overlays
     * Age verification prompts
     * Newsletter signup forms
   - These obstacles must be addressed first as they can prevent interaction with the main content

4. BROWSER STATE ANALYSIS:
   - Thoroughly analyze the browser state information including:
     * URL and title to confirm the correct page
     * Interactive elements available for clicking, typing, etc.
     * Viewport metrics to determine if scrolling is needed
     * Accessibility tree (snapshot) to understand page structure and identify elements.
   - Use this information to make informed decisions about which actions to take.

5. ELEMENT SELECTION:
   - When selecting elements to interact with, prioritize using the interactive element selectors from the browser state
   - Always verify elements exist before attempting interaction
   - For forms, ensure all required fields are identified before submission

Your task is to perform the action requested by the user. You must use the tools provided to do so.
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

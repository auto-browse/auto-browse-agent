import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { browserStateService } from "@/browser/services/browserStateService";
import { createLLM } from "../services/llmService";

export async function createVerifierAgent() {
    const model = await createLLM();

    const browserState = await browserStateService.getBrowserState();
    const stateMessage = browserState.success ? browserState.message : 'Failed to get browser state';

    const verifierPrompt = `You are a plan execution verifier. Your job is to analyze if a planned action was successfully executed based on the current page state.

Planned Action: {planString}

Current Page State:
${stateMessage}

IMPORTANT VERIFICATION GUIDELINES:
1. Carefully analyze the browser state (URL, title, viewport metrics, interactive elements, accessibility tree) to determine if the action was successfully executed.
2. Pay special attention to visible elements on the page that indicate success or failure.
3. Consider the current URL and page title as primary indicators for navigation actions.
4. For interactions with elements, check if the expected changes appear in the interactive elements or accessibility tree.
5. For content extraction or search operations, verify if the target content is visible in the current browser state.
6. Consider the scroll position and viewport metrics when evaluating whether content is visible.

Analyze the plan, and the current page state to determine if the action was successfully completed.
If successful, explain what indicates success.
If not successful, explain what's missing or what went wrong.`;
    console.log(verifierPrompt);
    return await createReactAgent({
        llm: model,
        tools: [],
        stateModifier: verifierPrompt
    });
}

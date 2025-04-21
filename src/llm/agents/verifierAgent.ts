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

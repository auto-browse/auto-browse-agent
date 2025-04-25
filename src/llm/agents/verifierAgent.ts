import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { browserStateService } from "@/browser/services/browserStateService";
import { createLLM } from "../services/llmService";

export async function createVerifierAgent() {
    const model = await createLLM();

    const browserState = await browserStateService.getBrowserState();
    const stateMessage = browserState.success ? browserState.message : 'Failed to get browser state';

   const verifierPrompt = `You are a plan execution verifier. Your job is to analyze if a planned action was successfully executed based on the result and current page state.

Planned Action: {planString}
Action Result: {actionResult}
Current Page State:
${stateMessage}

IMPORTANT VERIFICATION GUIDELINES:

1. YOUR PRIMARY ROLE: You MUST assume the browser agent has already EXECUTED the planned action. Your job is to VERIFY if the execution was SUCCESSFUL by examining the current browser state and result.

2. DO NOT question whether the action was necessary or meaningful. That decision was made by the planner, and the browser agent has already attempted to execute it.

3. Focus ONLY on whether the result and current browser state reflects the expected outcome of the planned action:
   - For navigation: Is the URL or page title consistent with successful navigation?
   - For clicking: Have new elements appeared or disappeared as expected?
   - For form filling: Are form fields properly populated?
   - For scrolling: Is new content visible that wasn't before?

4. Consider all available evidence in the browser state:
   - URL and page title
   - Visible interactive elements
   - Viewport position and metrics
   - Page structure (from accessibility tree if available)

5. For actions like clicking on links to navigate:
   - Success = The page has changed to the expected destination
   - Do NOT conclude "action was not needed because we're already there"
   - Instead, verify that we ARE at the expected destination (which confirms success)

6. For VERIFICATION tasks (e.g., "Check for cookie banners", "Verify if logged in"):
   - Success can mean either finding OR confirming the absence of something
   - If the task was to check for something and it's not there, that's a SUCCESSFUL check (not a failure)
   - Example: "Check for cookie consent popups" is SUCCESSFUL if you can confirm either:
     a) Cookie popups were found and can be described, OR
     b) No cookie popups are present on the page

7. Use specific evidence from the current state to support your conclusion.

8. Your response MUST contain ONE of these verdicts at the start:
   - "SUCCESS: [explanation of evidence supporting successful execution]"
   - "FAILURE: [explanation of what indicates the action did not complete as expected]"

Analyze the plan, result and the current page state to determine if the action was successfully completed.`;
    console.log(verifierPrompt);
    return await createReactAgent({
        llm: model,
        tools: [],
        stateModifier: verifierPrompt
    });
}

import { createVerifierAgent } from "../../agents/verifierAgent";
import { BrowserGraphState } from "../types/state";

export const verifierNode = async (state: typeof BrowserGraphState.State) => {
    const agent = await createVerifierAgent();

    const result = await agent.invoke({
        messages: [{
            role: "user",
            content: JSON.stringify({
                planString: state.planString,
                reactresult: state.reactresult
            }, null, 2)
        }]
    });
    console.log("Verifier result:", result);

    // Get the verification result
    const verificationResult = result.messages[result.messages.length - 1].content;

    return {
        messages: result.messages,
        pastSteps: [[state.planString, verificationResult]]  // Record plan and verification as step-result pair
    };
};
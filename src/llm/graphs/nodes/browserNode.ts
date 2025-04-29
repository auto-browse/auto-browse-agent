//import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "../../agents/reactAgent";
import { BrowserGraphState } from "../types/state";

export const browserNode = async (state: typeof BrowserGraphState.State) => {
    const agent = await createAgent();
    const result = await agent.invoke({
        messages: [{
            role: "user",
            content: state.planString
        }]
    });
    console.log("Agent result:", result);
    // Get the planned next step from the AI's response
    const reactresult = result.messages[result.messages.length - 1].content;

    // Parse the response text into an object
    let parsedResponse;
    let action_result;

    try
    {
        parsedResponse = JSON.parse(typeof reactresult === 'string' ? reactresult : JSON.stringify(reactresult));
        action_result = parsedResponse.action_result;
    } catch (error)
    {
        console.error("Error parsing response as JSON:", error);
        console.log("Raw response content:", reactresult);
        // If parsing fails, use the raw response as action_result
        action_result = `Failed to parse response as JSON. Raw response: ${reactresult}`;
    }

    // Ensure nextStep is always a string
    const final_result = typeof action_result === 'string'
        ? action_result
        : JSON.stringify(action_result);


    return {
        messages: result.messages,
        reactresult: final_result,
    };
};

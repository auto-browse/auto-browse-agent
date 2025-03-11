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

    return {
        messages: result.messages,
        reactresult: reactresult,
    };
};

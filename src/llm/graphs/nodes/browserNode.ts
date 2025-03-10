//import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "../../agents/reactAgent";
import { BrowserGraphState } from "../types/state";

export const browserNode = async (state: typeof BrowserGraphState.State) => {
    const agent = await createAgent();
    const result = await agent.invoke({
        messages: [{
            role: "user",
            content: state.task
        }]
    });
    console.log("Agent result:", result);
    return {
        messages: result.messages
    };
};

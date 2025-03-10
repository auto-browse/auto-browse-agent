import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "../../agents/reactAgent";
import { BrowserGraphState } from "../types/state";

export const browserNode = async (state: typeof BrowserGraphState.State) => {
    const agent = await createAgent();
    if (!(state.messages[0] instanceof HumanMessage))
    {
        throw new Error("Expected last message to be a human message");
    }

    const result = await agent.invoke({
        messages: [{
            role: "user",
            content: state.messages[0].content
        }]
    });
    console.log("Agent result:", result);
    return {
        messages: [
            state.messages[0],
            { messages: result.messages }
        ]
    };
};

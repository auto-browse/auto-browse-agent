import { HumanMessage } from "@langchain/core/messages";
import { createAgent } from "../../agents/reactAgent";
import { BrowserGraphState } from "../types/state";

export const browserNode = async (state: typeof BrowserGraphState.State) => {
    const agent = await createAgent();
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];

    if (!(lastMessage instanceof HumanMessage))
    {
        throw new Error("Expected last message to be a human message");
    }

    const result = await agent.invoke({
        messages: [{
            role: "user",
            content: lastMessage.content
        }]
    });
    console.log("Agent result:", result);
    return { messages: [result] };
};

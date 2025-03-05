import { HumanMessage } from "@langchain/core/messages";
//import { RunnableConfig } from "@langchain/core/runnables";
import { createAgent } from "../../agents/reactAgent";
import { BrowserGraphState } from "../types/state";

export const browserNode = async (_state: typeof BrowserGraphState.State) => {
    const agent = await createAgent();

    const messages = _state.messages;
    const lastMessage = messages[messages.length - 1];

    if (!(lastMessage instanceof HumanMessage))
    {
        throw new Error("Expected last message to be a human message");
    }

    const inputs = {
        messages: [{
            role: "user",
            content: lastMessage.content
        }]
    };

    const result = await agent.invoke(inputs);
    return { messages: [result] };
};

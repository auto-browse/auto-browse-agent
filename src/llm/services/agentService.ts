import { HumanMessage } from "@langchain/core/messages";
import { streamBrowserGraph } from "../graphs/browserGraph";

class AgentService {
    async processMessage(message: string) {
        const input = {
            messages: [new HumanMessage(message)]
        };

        return await streamBrowserGraph(input, { streamMode: "messages" });
    }
}

export const agentService = new AgentService();

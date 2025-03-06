import { createAgent } from "../agents/reactAgent";

export async function streamBrowserGraph(input: { messages: any[]; }, options?: { streamMode?: "messages"; }) {
    const agent = await createAgent();
    return await agent.stream(
        input,
        { streamMode: options?.streamMode || "messages" }
    );
}

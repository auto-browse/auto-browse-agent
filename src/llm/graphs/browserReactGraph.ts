import { START, StateGraph } from "@langchain/langgraph/web";
import { browserNode } from "./nodes/browserNode";
//import { plannerNode } from "./nodes/plannerNode";
//import { verifierNode } from "./nodes/verifierNode";
import { BrowserGraphState } from "./types/state";
import { HumanMessage } from "@langchain/core/messages";


// Create route function to control flow based on planString
/* const _routeFromPlanner = (state: typeof BrowserGraphState.State) => {
    if (state.planString.startsWith("Task completed:"))
    {
        return "end";
    }
    return "browser";
}; */


const workflow = new StateGraph(BrowserGraphState)
    .addNode("browser", browserNode)
    .addEdge(START, "browser");



export async function* streamMessage(message: string) {
    const graph = workflow.compile();

    // Transform the input message into a HumanMessage
    const userMessage = new HumanMessage(message);

    const stream = await graph.stream({
        task: message,
        messages: [userMessage], // Initialize with the user's message
        planString: message,
        pastSteps: [],
        reactresult: ""
    }, {
        recursionLimit: 10,
        streamMode: "updates"
    });

    for await (const chunk of stream)
    {
        console.log("Chunk:", chunk);
        yield chunk;
    }
}

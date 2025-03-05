import {
    END,
    START,
    StateGraph,
} from "@langchain/langgraph/web";
import { BrowserGraphState } from "./types/state";
import { browserNode } from "./nodes/browserNode";

export async function createBrowserGraph() {
    // Define the graph
    const workflow = new StateGraph(BrowserGraphState)
        .addNode("browser", browserNode)
        .addEdge(START, "browser")
        .addEdge("browser", END);

    // Compile the graph
    return workflow.compile();
}

export async function streamBrowserGraph(input: { messages: any[]; }) {
    const app = await createBrowserGraph();

    // Stream intermediate steps from the graph
    const eventStream = app.streamEvents(
        input,
        { version: "v2" },
        //{ includeNames: ["browser_workflow"] }
    );


    return eventStream;
}

import { START, END, StateGraph } from "@langchain/langgraph/web";
import { browserNode } from "./nodes/browserNode";
import { plannerNode } from "./nodes/plannerNode";
import { verifierNode } from "./nodes/verifierNode";
import { BrowserGraphState } from "./types/state";

// Create route function to control flow based on planString
/* const _routeFromPlanner = (state: typeof BrowserGraphState.State) => {
    if (state.planString.startsWith("Task completed:"))
    {
        return "end";
    }
    return "browser";
}; */

const shouldContinue = (state: typeof BrowserGraphState.State) => {
    // Check if planString is a string before calling startsWith
    if (typeof state.planString === 'string' && state.planString.startsWith("Task completed:"))
    {
        return "end";
    }

    // If planString is an object with a description property
    const planObj = state.planString as any;
    if (planObj &&
        typeof planObj === 'object' &&
        'description' in planObj &&
        typeof planObj.description === 'string' &&
        planObj.description.startsWith("Task completed:"))
    {
        return "end";
    }

    return "browser";
};

export async function processMessage(message: string) {
    const graph = new StateGraph(BrowserGraphState);

    graph.addNode("planner", plannerNode)
        .addNode("browser", browserNode)
        .addNode("verifier", verifierNode)
        .addEdge(START, "planner")
        .addConditionalEdges("planner", shouldContinue, {
            browser: "browser",
            end: END
        })
        .addEdge("browser", "verifier")
        .addEdge("verifier", "planner");

    const compiledGraph = graph.compile({ name: "browser_graph" });
    return compiledGraph.invoke({
        task: message,
        messages: [],
        planString: "",
        pastSteps: [],
        reactresult: ""
    });
}

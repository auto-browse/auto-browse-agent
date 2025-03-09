import { START, END, StateGraph } from "@langchain/langgraph/web";
import { browserNode } from "./nodes/browserNode";
import { BrowserGraphState } from "./types/state";
import { HumanMessage } from "@langchain/core/messages";

export async function processMessage(message: string) {
    const graph = new StateGraph(BrowserGraphState)
        .addNode("browser", browserNode)
        .addEdge(START, "browser")
        .addEdge("browser", END);


    const compiledGraph = graph.compile({ name: "browser_graph" });

    return compiledGraph.invoke({
        messages: [new HumanMessage(message)]
    });
}

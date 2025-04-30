import { HumanMessage, AIMessage } from "@langchain/core/messages"; // Added BaseMessage
import { Tool } from "@langchain/core/tools";

import { createLLM } from "../services/llmService";
//import { createBrowserTools } from "../tools/browser/browserTools";
import { BrowserGraphState } from "./types/state";
//import { tool } from "@langchain/core/tools";
//import { z } from "zod";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { START, END, StateGraph } from "@langchain/langgraph/web"; // Use web for streamLog
import { createLangChainTool } from '../tools/tool';

import snapshot from '../tools/snapshot';
import navigateTools from '../tools/navigate';



// Convert our custom tools to LangChain tools
const allTools = [
    ...navigateTools(true),
    ...snapshot,
].map(customTool => createLangChainTool(customTool));
const browserTools = [...allTools] as Tool[];
//const browserTools = snapshot.map(createLangChainTool) as unknown as Tool[];




//const llmWithTools = model.bindTools(browserTools, { parallel_tool_calls: false });

//const browserTools = createBrowserTools();
const tools = [...browserTools];
const toolNode = new ToolNode(tools);

// --- Async Graph Initialization ---
let compiledGraphPromise: Promise<any> | null = null; // Cache the promise

async function getCompiledGraph() {
    if (compiledGraphPromise)
    {
        return compiledGraphPromise;
    }

    compiledGraphPromise = (async () => {
        console.log("Initializing graph...");
        // Async part: Create LLM and bind tools
        const model = await createLLM();
        const boundModel = model.bindTools(tools, { parallel_tool_calls: false });

        // Define graph nodes and edges using the initialized model
        const routeMessage = (state: typeof BrowserGraphState.State) => {
            const { messages } = state;
            const lastMessage = messages[messages.length - 1] as AIMessage;
            if (!lastMessage?.tool_calls?.length)
            {
                return END;
            }
            return "tools";
        };

        const callModel = async (state: typeof BrowserGraphState.State) => {
            const { messages } = state;
            // messages are already typed as BaseMessage[] in the state definition
            const responseMessage = await boundModel.invoke(messages);
            return { messages: [responseMessage] };
        };

        // Define and compile the graph
        const workflow = new StateGraph(BrowserGraphState)
            .addNode("agent", callModel)
            .addNode("tools", toolNode)
            .addEdge(START, "agent")
            .addConditionalEdges("agent", routeMessage)
            .addEdge("tools", "agent");

        const graph = workflow.compile();
        console.log("Graph compiled successfully.");
        return graph;
    })();

    return compiledGraphPromise;
}

// --- Streaming Function ---
export async function* streamMessage(message: string) {
    // Ensure the graph is compiled before streaming
    const compiledGraph = await getCompiledGraph();

    const stream = await compiledGraph.stream({
        // task: message, // 'task' might not be part of BrowserGraphState, ensure state keys match
        messages: [new HumanMessage({ content: message })],
        planString: "", // Initialize required state fields
        pastSteps: [],
        reactresult: ""
    }, {
        recursionLimit: 10,
        streamMode: "updates" // Use "updates" or "values" as needed
    });

    for await (const chunk of stream)
    {
        yield chunk;
    }
}
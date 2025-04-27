import { BaseMessage } from "@langchain/core/messages"; // Added import
import { createAgent } from "../../agents/reactAgent";
import { BrowserGraphState } from "../types/state";

export const browserNode = async (state: typeof BrowserGraphState.State) => {
    const agent = await createAgent();
    // Get the stream iterator by calling stream()
    const stream = await agent.stream({
        messages: [{
            role: "user",
            content: state.planString
        }]
    }, {
        recursionLimit: 10,
        streamMode: "updates"
    });

    let allMessages: BaseMessage[] = []; // Accumulate all messages from the stream
    let finalResultContent: string | null = null; // Store the content of the last message for final processing

    console.log("--- Agent Stream Start ---");
    // Iterate through the stream chunks
    for await (const chunk of stream)
    {
        // Log intermediate steps. Adjust formatting based on actual chunk structure.
        // Example: Log LangChain stream events if applicable
        if (chunk.event)
        {
            console.log(`Event: ${chunk.event}, Name: ${chunk.name}, Data: ${JSON.stringify(chunk.data)}`);
        } else
        {
            // Fallback logging for other chunk structures
            console.log("Intermediate Chunk:", chunk);
        }

        // Accumulate messages. The exact structure depends on the agent's stream output.
        // This assumes chunks might contain a 'messages' array.
        if (chunk.messages && Array.isArray(chunk.messages) && chunk.messages.length > 0)
        {
            allMessages = allMessages.concat(chunk.messages);
            // Keep track of the latest message content
            const lastMessageInChunk = chunk.messages[chunk.messages.length - 1];
            finalResultContent = typeof lastMessageInChunk.content === 'string'
                ? lastMessageInChunk.content
                : JSON.stringify(lastMessageInChunk.content);
        } else if (chunk.content)
        {
            // Handle chunks that might directly represent message content
            finalResultContent = typeof chunk.content === 'string'
                ? chunk.content
                : JSON.stringify(chunk.content);
            // If the chunk structure represents a message, add it. (Requires knowing the structure)
            // Example: if (chunk.role && chunk.type) allMessages.push(chunk as BaseMessage);
        }
        // Add more specific checks based on the actual structure of stream chunks if needed
    }
    console.log("--- Agent Stream End ---");

    // Fallback: If finalResultContent wasn't captured directly, use the last accumulated message
    if (finalResultContent === null && allMessages.length > 0)
    {
        const lastMessage = allMessages[allMessages.length - 1];
        finalResultContent = typeof lastMessage.content === 'string'
            ? lastMessage.content
            : JSON.stringify(lastMessage.content);
    } else if (finalResultContent === null)
    {
        // Handle cases where the stream might finish without explicit content
        finalResultContent = "Agent stream finished without producing final content.";
        console.warn(finalResultContent);
    }

    // Process the final result content, similar to the original logic
    let parsedResponse;
    let action_result;
    try
    {
        parsedResponse = JSON.parse(finalResultContent);
        // Check if the parsed content has the expected structure (e.g., { action_result: ... })
        if (parsedResponse && typeof parsedResponse === 'object' && 'action_result' in parsedResponse)
        {
            action_result = parsedResponse.action_result;
        } else
        {
            // If structure is not as expected, use the raw content
            console.warn("Parsed final content does not contain 'action_result'. Using raw content.");
            action_result = finalResultContent;
        }
    } catch (error)
    {
        console.error("Error parsing final response content as JSON:", error);
        console.log("Raw final response content:", finalResultContent);
        action_result = `Failed to parse final response as JSON. Raw response: ${finalResultContent}`;
    }

    // Ensure the result used for state update is always a string
    const final_react_result = typeof action_result === 'string'
        ? action_result
        : JSON.stringify(action_result);

    // Deduplicate messages before returning (simple approach based on content)
    const uniqueMessages = Array.from(new Map(allMessages.map(msg => [JSON.stringify(msg.content), msg])).values());

    // Return the updated state, including all unique messages and the final processed result
    return {
        messages: uniqueMessages,
        reactresult: final_react_result,
        pastSteps: [[state.planString, final_react_result]] // Update pastSteps with the final result
    };
};

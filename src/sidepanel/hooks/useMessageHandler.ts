import { useState } from "react";
import { handleMessage } from "@/messaging/handlers/messageHandler";
import { ActionType, MessageRequest, MessageResponse } from "@/messaging/types";
import { streamMessage } from "@/llm/graphs/browserGraph";
import {
    AIMessage,
    BaseMessage,
    AIMessageChunk,
    ToolMessage,
    MessageType
} from "@langchain/core/messages";
import { NodeUpdate } from "@/components/shared/NodeStatusDisplay";

type ExtendedMessage = BaseMessage & {
    _getType?: () => MessageType;
    tool_call_chunks?: Array<{
        name: string;
        args: string;
    }>;
    name?: string;
};

// Define node values type to avoid unknown type errors
interface NodeValues {
    messages: ExtendedMessage[];
    task?: string;
    planString?: string;
    pastSteps?: [string, string][];
    reactresult?: string;
}

// Type guard functions
function hasToolCallChunks(msg: ExtendedMessage): msg is ExtendedMessage & { tool_call_chunks: Array<{ name: string; args: string; }>; } {
    return Array.isArray((msg as any).tool_call_chunks) && (msg as any).tool_call_chunks.length > 0;
}

function hasAdditionalKwargsWithToolCalls(msg: AIMessage): boolean {
    return (
        'additional_kwargs' in msg &&
        msg.additional_kwargs?.tool_calls !== undefined &&
        msg.additional_kwargs.tool_calls.length > 0
    );
}

// Extract content from a message
function extractMessageContent(msg: ExtendedMessage): string {
    if (msg instanceof AIMessageChunk)
    {
        if (hasToolCallChunks(msg))
        {
            const chunk = msg.tool_call_chunks[0];
            return `Tool: ${chunk.name}\nArgs: ${chunk.args}`;
        } else if (msg.content)
        {
            return String(msg.content);
        }
    } else if (msg instanceof AIMessage)
    {
        if (msg.content)
        {
            const content = String(msg.content);
            return content;
        }
        if (hasAdditionalKwargsWithToolCalls(msg))
        {
            const toolCalls = msg.additional_kwargs.tool_calls;
            if (toolCalls && toolCalls.length > 0)
            {
                const tool = toolCalls[0];
                return `Tool: ${tool.function.name}\nArgs: ${tool.function.arguments}`;
            }
        }
    } else if (msg instanceof ToolMessage)
    {
        return `Tool Result: ${msg.content}`;
    } else if ('content' in msg && msg.content)
    {
        return String(msg.content);
    }
    return "";
}

export const useMessageHandler = () => {
    const [message, setMessage] = useState<string>("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [nodeUpdates, setNodeUpdates] = useState<NodeUpdate[]>([]);
    const [currentNode, setCurrentNode] = useState<string | undefined>(undefined);

    // Function to get streaming updates
    const handleChatWithStreaming = async (message: string): Promise<MessageResponse> => {
        setIsLoading(true);
        setNodeUpdates([]);
        setCurrentNode(undefined);

        try
        {
            const streamGenerator = streamMessage(message);
            let finalOutput = "";
            let latestMessages: ExtendedMessage[] = [];

            for await (const chunk of streamGenerator)
            {
                for (const [nodeName, nodeValue] of Object.entries(chunk))
                {
                    setCurrentNode(nodeName);

                    // Type assertion to avoid unknown type errors
                    const values = nodeValue as NodeValues;

                    // Create node update entry
                    if (values.messages && values.messages.length > 0)
                    {
                        const latestMsg = values.messages[values.messages.length - 1];
                        const content = extractMessageContent(latestMsg);

                        // Store the latest messages for final output
                        latestMessages = values.messages;

                        // Add update for this node
                        setNodeUpdates(prev => [
                            ...prev,
                            {
                                node: nodeName,
                                status: "active",
                                content: content.length > 300
                                    ? content.substring(0, 300) + "..."
                                    : content,
                                timestamp: new Date()
                            }
                        ]);
                    }
                }
            }

            // Mark the current node as completed when stream ends
            setNodeUpdates(prev => {
                const updatedList = [...prev];
                if (currentNode)
                {
                    updatedList.push({
                        node: currentNode,
                        status: "completed",
                        timestamp: new Date()
                    });
                }
                return updatedList;
            });

            // Get the final message
            if (latestMessages.length > 0)
            {
                finalOutput = extractMessageContent(latestMessages[latestMessages.length - 1]);
            }

            setMessage(finalOutput);
            setCurrentNode(undefined);

            return {
                success: true,
                message: finalOutput
            } as MessageResponse;
        } catch (error)
        {
            const errorMessage = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
            setMessage(errorMessage);

            // Add error state to node updates
            setNodeUpdates(prev => [
                ...prev,
                {
                    node: currentNode || "unknown",
                    status: "completed",
                    content: errorMessage,
                    timestamp: new Date()
                }
            ]);

            return {
                success: false,
                message: errorMessage,
                error: error instanceof Error ? error : new Error(errorMessage)
            } as MessageResponse;
        } finally
        {
            setIsLoading(false);
        }
    };

    // Keep the original non-streaming version for compatibility
    const handleChat = async (message: string): Promise<MessageResponse> => {
        // Use streaming by default
        return handleChatWithStreaming(message);
    };

    const handleAction = async (action: ActionType): Promise<MessageResponse> => {
        setIsLoading(true);
        setScreenshot(null);
        try
        {
            const request: MessageRequest = { action };
            const response = await handleMessage(request);
            setMessage(response.message);
            if (response.screenshot)
            {
                setScreenshot(response.screenshot);
            }
            return response;
        } catch (error)
        {
            const errorMessage = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
            setMessage(errorMessage);
            return {
                success: false,
                message: errorMessage,
                error: error instanceof Error ? error : new Error(errorMessage)
            } as MessageResponse;
        } finally
        {
            setIsLoading(false);
        }
    };

    return {
        message,
        isLoading,
        handleAction,
        handleChat,
        screenshot,
        nodeUpdates,
        currentNode
    };
};

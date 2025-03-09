import { useState } from "react";
import { handleMessage } from "@/messaging/handlers/messageHandler";
import { ActionType, MessageRequest, MessageResponse } from "@/messaging/types";
import { processMessage } from "@/llm/graphs/browserGraph";
import {
    AIMessage,
    BaseMessage,
    AIMessageChunk,
    ToolMessage,
    MessageType
} from "@langchain/core/messages";

type ExtendedMessage = BaseMessage & {
    _getType?: () => MessageType;
    tool_call_chunks?: Array<{
        name: string;
        args: string;
    }>;
    name?: string;
};

interface GraphResponse {
    messages: [
        BaseMessage,
        {
            messages: ExtendedMessage[];
        }
    ];
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

export const useMessageHandler = () => {
    const [message, setMessage] = useState<string>("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChat = async (message: string): Promise<MessageResponse> => {
        setIsLoading(true);
        try
        {
            const response = await processMessage(message) as GraphResponse;
            console.log("Response from processMessage:", response);

            let output = "";
            const time = new Intl.DateTimeFormat('en-US', {
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }).format(new Date());

            // Process messages from the graph output
            const messages = response.messages[1].messages;
            for (const msg of messages)
            {
                console.log("Processing message:", msg);

                if (msg instanceof AIMessageChunk)
                {
                    console.log("Processing AIMessageChunk:", msg);
                    if (hasToolCallChunks(msg))
                    {
                        const chunk = msg.tool_call_chunks[0];
                        output += `Tool Call: ${chunk.name}\n`;
                        output += `Arguments: ${chunk.args}\n`;
                    } else if (msg.content)
                    {
                        output += `${msg.content}\n`;
                    }
                }
                else if (msg instanceof AIMessage)
                {
                    console.log("Processing AIMessage:", msg);
                    if (msg.content)
                    {
                        output += `${msg.content}\n`;
                    }
                    if (hasAdditionalKwargsWithToolCalls(msg))
                    {
                        const toolCalls = msg.additional_kwargs.tool_calls;
                        if (toolCalls && toolCalls.length > 0)
                        {
                            const tool = toolCalls[0];
                            output += `Tool Call: ${tool.function.name}\n`;
                            output += `Arguments: ${tool.function.arguments}\n`;
                        }
                    }
                }
                else if (msg instanceof ToolMessage)
                {
                    console.log("Processing ToolMessage:", msg);
                    output += `Tool Response: ${msg.content}\n`;
                }
                else if ('content' in msg && msg.content)
                {
                    console.log("Processing other message type:", msg);
                    output += `${msg.content}\n`;
                }
            }

            const finalOutput = output.trim();
            setMessage(`${time}\n${finalOutput}\n${time}`);

            return {
                success: true,
                message: finalOutput
            } as MessageResponse;
        } catch (error)
        {
            console.error("Error in chat:", error);
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
            console.error(`Error handling action ${action}:`, error);
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
    };
};

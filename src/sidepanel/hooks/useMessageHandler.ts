import { useState } from "react";
import { handleMessage } from "@/messaging/handlers/messageHandler";
import { ActionType, MessageRequest, MessageResponse } from "@/messaging/types";
import { agentService } from "@/llm/services/agentService";
// import { StreamEvent } from "@langchain/core/tracers/log_stream";

export const useMessageHandler = () => {
    const [message, setMessage] = useState<string>("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChat = async (message: string): Promise<MessageResponse> => {
        setIsLoading(true);
        try
        {
            const stream = await agentService.processMessage(message);
            let fullResponse = "";

            for await (const event of stream)
            {
                if ("data" in event && typeof event.data === "string")
                {
                    const data = JSON.parse(event.data);
                    if (data.messages && data.messages.length > 0)
                    {
                        const lastMessage = data.messages[data.messages.length - 1];
                        if (lastMessage?.content)
                        {
                            fullResponse = lastMessage.content;
                            setMessage(fullResponse);
                        }
                    }
                }
            }

            return {
                success: true,
                message: fullResponse
            };
        } catch (error)
        {
            console.error("Error in chat:", error);
            const errorMessage = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
            setMessage(errorMessage);
            return {
                success: false,
                message: errorMessage,
                error: error instanceof Error ? error : new Error(errorMessage)
            };
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
            };
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

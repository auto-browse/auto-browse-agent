import { useState } from "react";
import { handleMessage } from "@/messaging/handlers/messageHandler";
import { ActionType, MessageRequest } from "@/messaging/types";

export const useMessageHandler = () => {
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: ActionType) => {
        setIsLoading(true);
        try
        {
            const request: MessageRequest = { action };
            const response = await handleMessage(request);
            setMessage(response.message);
        } catch (error)
        {
            console.error(`Error handling action ${action}:`, error);
            setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally
        {
            setIsLoading(false);
        }
    };

    return {
        message,
        isLoading,
        handleAction,
    };
};

import { useState } from "react";
import { handleMessage } from "@/messaging/handlers/messageHandler";
import { ActionType, MessageRequest, MessageResponse } from "@/messaging/types";

export const useMessageHandler = () => {
    const [message, setMessage] = useState<string>("");
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: ActionType): Promise<MessageResponse> => {
        setIsLoading(true);
        setScreenshot(null); // Reset screenshot state
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
        screenshot,
    };
};

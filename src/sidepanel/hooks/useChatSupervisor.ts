import { useState, useEffect, useCallback } from "react";
import { ChatSupervisor } from "@/llm/supervisor/chatSupervisor";
import { ChatMessage } from "@/messaging/types";

export function useChatSupervisor() {
    const [supervisor, setSupervisor] = useState<ChatSupervisor>();
    const [isInitializing, setIsInitializing] = useState(true);
    const [error, setError] = useState<string>();

    useEffect(() => {
        const initSupervisor = async () => {
            try
            {
                const newSupervisor = new ChatSupervisor();
                await newSupervisor.initialize();
                setSupervisor(newSupervisor);
                setError(undefined);
            } catch (err)
            {
                setError(err instanceof Error ? err.message : String(err));
            } finally
            {
                setIsInitializing(false);
            }
        };

        initSupervisor();
    }, []);

    const processMessage = useCallback(async (message: ChatMessage): Promise<ChatMessage> => {
        if (!supervisor)
        {
            throw new Error("Chat supervisor not initialized");
        }

        try
        {
            const response = await supervisor.processMessage(message.content);

            return {
                id: (Date.now() + 1).toString(),
                content: response,
                sender: "assistant",
                timestamp: new Date()
            };
        } catch (err)
        {
            const errorMessage = err instanceof Error ? err.message : String(err);
            return {
                id: (Date.now() + 1).toString(),
                content: `Error: ${errorMessage}`,
                sender: "assistant",
                timestamp: new Date()
            };
        }
    }, [supervisor]);

    const getState = useCallback(() => {
        return supervisor?.getState();
    }, [supervisor]);

    return {
        isInitializing,
        error,
        processMessage,
        getState,
        isReady: !!supervisor && !isInitializing
    };
}

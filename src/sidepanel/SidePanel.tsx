import React from "react";
import { ActionButtons } from "./components/ActionButtons";
import { StatusDisplay } from "@/components/shared/StatusDisplay";
import { useMessageHandler } from "./hooks/useMessageHandler";

export const SidePanel: React.FC = () => {
    const { message, isLoading, handleAction } = useMessageHandler();

    return (
        <div className="p-4 flex flex-col min-h-screen bg-background text-foreground">
            <h1 className="text-2xl font-bold mb-6">Auto Browse Extension</h1>

            <div className="flex-1">
                <ActionButtons
                    onAction={handleAction}
                    isLoading={isLoading}
                />

                {(message || isLoading) && (
                    <StatusDisplay
                        message={isLoading ? "Loading..." : message}
                    />
                )}
            </div>
        </div>
    );
};

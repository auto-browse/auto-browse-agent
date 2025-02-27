import React from "react";
import { Button } from "@/components/ui/button";
import { ActionType } from "@/messaging/types";

interface ActionButtonsProps {
    onAction: (action: ActionType) => Promise<void>;
    isLoading: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onAction, isLoading }) => {
    return (
        <div className="flex flex-col gap-4">
            <Button
                onClick={() => onAction(ActionType.GET_PAGE_TITLE)}
                disabled={isLoading}
                variant="outline"
                className="w-full"
            >
                Get Page Title
            </Button>
            <Button
                onClick={() => onAction(ActionType.HIGHLIGHT_LINKS)}
                disabled={isLoading}
                variant="outline"
                className="w-full"
            >
                Highlight Links
            </Button>
        </div>
    );
};

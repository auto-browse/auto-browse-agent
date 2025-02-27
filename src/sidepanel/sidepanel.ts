import { handleMessage } from "../messaging/handlers/messageHandler";
import { ActionType, MessageRequest } from "../messaging/types";
import { browserService } from "../browser/services/browserService";
import { highlightService } from "../browser/services/highlightService";

document.addEventListener("DOMContentLoaded", () => {
    // Example: Create basic UI elements
    // This will be replaced with React components later
    function createUI() {
        const root = document.getElementById("sidepanel-root");
        if (!root) return;

        // Create and append buttons
        const getTitleBtn = document.createElement("button");
        getTitleBtn.textContent = "Get Page Title";
        getTitleBtn.onclick = async () => {
            try
            {
                const request: MessageRequest = {
                    action: ActionType.GET_PAGE_TITLE
                };
                const response = await handleMessage(request);
                updateStatus(response.message);
            } catch (error)
            {
                console.error("Error getting page title:", error);
            }
        };

        const highlightBtn = document.createElement("button");
        highlightBtn.textContent = "Highlight Links";
        highlightBtn.onclick = async () => {
            try
            {
                const request: MessageRequest = {
                    action: ActionType.HIGHLIGHT_LINKS
                };
                const response = await handleMessage(request);
                updateStatus(response.message);
            } catch (error)
            {
                console.error("Error highlighting links:", error);
            }
        };

        // Create status display
        const status = document.createElement("div");
        status.id = "status";
        status.style.marginTop = "16px";
        status.style.padding = "8px";
        status.style.border = "1px solid #ccc";
        status.style.borderRadius = "4px";

        // Add elements to root
        root.appendChild(getTitleBtn);
        root.appendChild(document.createElement("br"));
        root.appendChild(highlightBtn);
        root.appendChild(status);
    }

    function updateStatus(message: string) {
        const status = document.getElementById("status");
        if (status)
        {
            status.textContent = message;
        }
    }

    createUI();
});

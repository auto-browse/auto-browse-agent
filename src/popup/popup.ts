import { handleMessage } from "../messaging/handlers/messageHandler";
import { ActionType, MessageRequest } from "../messaging/types";

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("popup-root");
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
            updateStatus("Error: " + (error instanceof Error ? error.message : String(error)));
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
            updateStatus("Error: " + (error instanceof Error ? error.message : String(error)));
        }
    };

    // Create status display
    const status = document.createElement("div");
    status.id = "status";
    status.style.marginTop = "16px";
    status.style.padding = "8px";
    status.style.border = "1px solid #ccc";
    status.style.borderRadius = "4px";

    // Add styles to buttons
    [getTitleBtn, highlightBtn].forEach(btn => {
        btn.style.margin = "4px";
        btn.style.padding = "8px 16px";
        btn.style.borderRadius = "4px";
        btn.style.border = "1px solid #ccc";
        btn.style.cursor = "pointer";
        btn.style.backgroundColor = "#f8f9fa";
    });

    // Add elements to root
    root.appendChild(getTitleBtn);
    root.appendChild(document.createElement("br"));
    root.appendChild(highlightBtn);
    root.appendChild(status);

    // Test connection on load
    testConnection();
});

function updateStatus(message: string) {
    const status = document.getElementById("status");
    if (status)
    {
        status.textContent = message;
    }
}

async function testConnection() {
    try
    {
        const request: MessageRequest = {
            action: ActionType.TEST_CONNECTION
        };
        const response = await handleMessage(request);
        updateStatus(response.message);
    } catch (error)
    {
        console.error("Error testing connection:", error);
        updateStatus("Error: " + (error instanceof Error ? error.message : String(error)));
    }
}

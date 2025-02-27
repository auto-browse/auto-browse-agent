import { ActionType, MessageRequest, MessageResponse } from "../types";

document.addEventListener("DOMContentLoaded", () => {
    const testConnectionBtn = document.getElementById("test-connection") as HTMLButtonElement;
    const highlightLinksBtn = document.getElementById("highlight-links") as HTMLButtonElement;
    const statusDiv = document.getElementById("status") as HTMLDivElement;

    // Send message to background script and handle response
    async function sendMessage(request: MessageRequest): Promise<void> {
        try
        {
            const response = await chrome.runtime.sendMessage(request) as MessageResponse;
            updateStatus(response.message, response.success);
        } catch (error)
        {
            updateStatus(
                error instanceof Error ? error.message : String(error),
                false
            );
        }
    }

    // Update status display
    function updateStatus(message: string, success: boolean): void {
        statusDiv.textContent = message;
        statusDiv.className = success ? "success" : "error";
    }

    // Event listeners
    testConnectionBtn.addEventListener("click", () => {
        sendMessage({ action: ActionType.TEST_CONNECTION });
    });

    highlightLinksBtn.addEventListener("click", () => {
        sendMessage({ action: ActionType.HIGHLIGHT_LINKS });
    });
});

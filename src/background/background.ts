import { handleMessage } from "../messaging/handlers/messageHandler";
import { MessageRequest, MessageResponse } from "../messaging/types";

// Listen for messages from extension components
chrome.runtime.onMessage.addListener(
    (
        request: MessageRequest,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: MessageResponse) => void
    ) => {
        // Handle the message asynchronously
        handleMessage(request)
            .then(sendResponse)
            .catch((error) => {
                console.error("Background script error:", error);
                sendResponse({
                    success: false,
                    message: error instanceof Error ? error.message : String(error),
                    error: error instanceof Error ? error : new Error(String(error))
                });
            });

        // Return true to indicate we will send response asynchronously
        return true;
    }
);

// Log when the extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    console.log("Extension installed/updated:", details.reason);
});

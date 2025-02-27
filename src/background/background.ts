import { MessageRequest, MessageResponse } from "../types";
import { handleMessage } from "../actions/messageHandler";

// Listen for messages from popup
chrome.runtime.onMessage.addListener(
    (request: MessageRequest, sender, sendResponse) => {
        // Handle async response
        handleMessage(request)
            .then((response: MessageResponse) => {
                sendResponse(response);
            })
            .catch((error: Error) => {
                sendResponse({
                    success: false,
                    message: error.message,
                    error
                });
            });

        // Return true to indicate we will respond asynchronously
        return true;
    }
);

import { ActionType, MessageRequest, MessageResponse } from "../types";
import { browserService } from "../../browser/services/browserService";
import { highlightService } from "../../browser/services/highlightService";

/**
 * Handle messages from the extension popup
 * @param {MessageRequest} request - The message request
 * @returns {Promise<MessageResponse>} Response to the message
 */
export async function handleMessage(request: MessageRequest): Promise<MessageResponse> {
    try
    {
        switch (request.action)
        {
            case ActionType.TEST_CONNECTION:
                return {
                    success: true,
                    message: "Connection successful"
                };

            case ActionType.GET_PAGE_TITLE: {
                const response = await browserService.getPageTitle();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error
                };
            }

            case ActionType.HIGHLIGHT_LINKS: {
                const response = await highlightService.highlightLinks();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error
                };
            }

            default:
                return {
                    success: false,
                    message: `Unknown action: ${request.action}`
                };
        }
    } catch (error)
    {
        return {
            success: false,
            message: error instanceof Error ? error.message : String(error),
            error: error instanceof Error ? error : new Error(String(error))
        };
    }
}

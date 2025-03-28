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

            case ActionType.COUNT_ELEMENTS: {
                const response = await browserService.countElements();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error
                };
            }

            case ActionType.GET_METADATA: {
                const response = await browserService.getMetadata();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error
                };
            }

            case ActionType.ANALYZE_PAGE: {
                const response = await browserService.analyzePage();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error
                };
            }

            case ActionType.GET_ACCESSIBILITY_SNAPSHOT: {
                const response = await browserService.getAccessibilitySnapshot();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_DOM_TREE: {
                const response = await browserService.getDomTree();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_DOM_TREE_WITH_BUILD: {
                const response = await browserService.getDomTreeWithBuild();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_DOM_TREE_WITH_PAGE_SCRIPT: {
                const response = await browserService.getDomTreeWithPageScript();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.ANALYZE_COOKIE_BANNERS: {
                const response = await browserService.analyzeCookieBanners();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.EXPLORE_SHADOW_DOM: {
                const response = await browserService.exploreShadowDom();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_INTERACTIVE_MAP: {
                const response = await browserService.getInteractiveMap();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_FORMATTED_INTERACTIVE_MAP: {
                const response = await browserService.getFormattedInteractiveMap();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_ELEMENT_XPATHS: {
                const response = await browserService.getElementXpaths();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_VIEWPORT: {
                const response = await browserService.getViewportState();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_BROWSER_STATE: {
                const response = await browserService.getBrowserState();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_CLICKABLE_ELEMENTS: {
                const response = await browserService.getClickableElements();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_ELEMENT_TREE: {
                const response = await browserService.getElementTree();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_SELECTOR_MAP: {
                const response = await browserService.getSelectorMap();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_TEXT_MAP: {
                const response = await browserService.getTextMap();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_DOM_TREE_WITH_NEW_SCRIPT: {
                const response = await browserService.getDomTreeWithNewScript();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.GET_CURRENT_URL: {
                const response = await browserService.getCurrentUrl();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    data: response.data
                };
            }

            case ActionType.TAKE_SCREENSHOT: {
                const response = await browserService.takeScreenshot();
                return {
                    success: response.success,
                    message: response.message,
                    error: response.error,
                    screenshot: response.screenshot
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

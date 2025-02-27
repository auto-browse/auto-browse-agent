import { ChromeTab, BrowserServiceResponse } from "../types";

/**
 * Get the active tab in the current window
 * @returns {Promise<ChromeTab>} The active tab
 */
export async function getActiveTab(): Promise<ChromeTab> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab)
    {
        throw new Error("No active tab found");
    }
    return tab;
}

/**
 * Handle errors in browser operations
 * @param {Error} error - The error to handle
 * @returns {BrowserServiceResponse} Response with error details
 */
export function handleError(error: Error): BrowserServiceResponse {
    console.error("Browser operation error:", error);
    return {
        success: false,
        message: error.message,
        error: error
    };
}

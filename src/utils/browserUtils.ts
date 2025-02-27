import { ChromeTab, ServiceResponse } from "../types";

/**
 * Get the current active tab in the current window
 * @returns {Promise<ChromeTab>} The active tab
 */
export const getActiveTab = async (): Promise<ChromeTab> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab)
    {
        throw new Error("No active tab found");
    }
    return tab;
};

/**
 * Handle errors in async operations
 * @param {Error} error - The error to handle
 * @returns {ServiceResponse} Error response
 */
export const handleError = (error: Error): ServiceResponse => {
    console.error("Operation failed:", error);
    return {
        success: false,
        message: `Error: ${error.message}`,
        error
    };
};

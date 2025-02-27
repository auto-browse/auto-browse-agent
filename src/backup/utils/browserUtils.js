/**
 * Get the current active tab in the current window
 * @returns {Promise<chrome.tabs.Tab>} The active tab
 */
export const getActiveTab = async () => {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab;
};

/**
 * Handle errors in async operations
 * @param {Error} error - The error to handle
 * @returns {string} Error message
 */
export const handleError = (error) => {
	console.error("Operation failed:", error);
	return `Error: ${error.message}`;
};

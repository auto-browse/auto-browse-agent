import { handleMessage } from "../actions/messageHandler.js";

// Add message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	handleMessage(request)
		.then(sendResponse)
		.catch((error) => sendResponse(`Error: ${error.message}`));
	return true; // Will respond asynchronously
});

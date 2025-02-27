import { TEST_CONNECTION, HIGHLIGHT_LINKS } from "../actions/actionTypes.js";

const resultElement = document.getElementById("result");
if (!resultElement) {
	throw new Error("Result element not found");
}

const updateResult = (message) => {
	resultElement.textContent = message;
};

const sendMessage = async (action, loadingMessage) => {
	try {
		updateResult(loadingMessage);
		const result = await chrome.runtime.sendMessage({ action });
		updateResult(result);
	} catch (error) {
		updateResult(`Error: ${error.message}`);
	}
};

// Initialize button handlers
const initializeHandlers = () => {
	const testButton = document.getElementById("testButton");
	const highlightButton = document.getElementById("highlightButton");

	if (!testButton || !highlightButton) {
		throw new Error("Required buttons not found");
	}

	testButton.addEventListener("click", () =>
		sendMessage(TEST_CONNECTION, "Getting page title...")
	);

	highlightButton.addEventListener("click", () =>
		sendMessage(HIGHLIGHT_LINKS, "Highlighting links...")
	);
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeHandlers);

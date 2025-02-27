import { TEST_CONNECTION, HIGHLIGHT_LINKS } from "./actionTypes.js";
import { browserService } from "../services/browserService.js";
import { highlightService } from "../services/highlightService.js";
import { handleError } from "../utils/browserUtils.js";

/**
 * Handle incoming messages from the extension
 * @param {Object} request - The message request
 * @returns {Promise<string>} Response message
 */
export const handleMessage = async (request) => {
	try {
		switch (request.action) {
			case TEST_CONNECTION:
				return await browserService.getPageTitle();
			case HIGHLIGHT_LINKS:
				return await highlightService.highlightLinks();
			default:
				throw new Error(`Unknown action: ${request.action}`);
		}
	} catch (error) {
		return handleError(error);
	}
};

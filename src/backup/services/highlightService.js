import { browserService } from "./browserService.js";
import { handleError } from "../utils/browserUtils.js";

/**
 * Service class for managing DOM highlighting operations
 */
class HighlightService {
	/**
	 * Highlight all links on the current page
	 * @returns {Promise<string>} Result message
	 */
	async highlightLinks() {
		try {
			const { browser, page } = await browserService.connectToActivePage();

			const result = await page.evaluate(() => {
				const links = document.querySelectorAll("a");
				links.forEach((link) => {
					link.style.backgroundColor = "yellow";
					link.style.border = "2px solid red";
				});
				return `Highlighted ${links.length} links`;
			});

			await browser.disconnect();
			return result;
		} catch (error) {
			return handleError(error);
		}
	}
}

export const highlightService = new HighlightService();

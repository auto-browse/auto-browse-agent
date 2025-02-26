import {
	connect,
	ExtensionTransport
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";
import { getActiveTab, handleError } from "../utils/browserUtils.js";

/**
 * Service class for managing browser operations using Puppeteer
 */
class BrowserService {
	/**
	 * Connect to the current active tab and get its title
	 * @returns {Promise<string>} The page title
	 */
	async getPageTitle() {
		try {
			const tab = await getActiveTab();
			const browser = await connect({
				transport: await ExtensionTransport.connectTab(tab.id)
			});

			const [page] = await browser.pages();
			const title = await page.title();

			await browser.disconnect();
			return `Current page title: ${title}`;
		} catch (error) {
			return handleError(error);
		}
	}

	/**
	 * Connect to browser and get the active page
	 * @returns {Promise<{ browser: Browser, page: Page }>}
	 */
	async connectToActivePage() {
		const tab = await getActiveTab();
		const browser = await connect({
			transport: await ExtensionTransport.connectTab(tab.id)
		});
		const [page] = await browser.pages();
		return { browser, page };
	}
}

export const browserService = new BrowserService();

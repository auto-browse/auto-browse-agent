import {
    connect,
    ExtensionTransport,
    Browser,
    Page
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";
import { getActiveTab, handleError } from "../utils/browserUtils";
import { BrowserConnection, ServiceResponse } from "../types";

/**
 * Service class for managing browser operations using Puppeteer
 */
class BrowserService {
    /**
     * Get the title of the current active tab
     * @returns {Promise<ServiceResponse>} Response with page title or error
     */
    async getPageTitle(): Promise<ServiceResponse> {
        try
        {
            const tab = await getActiveTab();
            if (!tab.id)
            {
                throw new Error("No tab ID found");
            }

            const browser = await connect({
                transport: await ExtensionTransport.connectTab(tab.id)
            });

            const [page] = await browser.pages();
            const title = await page.title();

            await browser.disconnect();
            return {
                success: true,
                message: `Current page title: ${title}`
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Connect to browser and get the active page
     * @returns {Promise<BrowserConnection>} Browser and page connection
     */
    async connectToActivePage(): Promise<BrowserConnection> {
        const tab = await getActiveTab();
        if (!tab.id)
        {
            throw new Error("No tab ID found");
        }

        const browser = await connect({
            transport: await ExtensionTransport.connectTab(tab.id)
        });
        const [page] = await browser.pages();
        return { browser: browser as Browser, page: page as Page };
    }
}

export const browserService = new BrowserService();

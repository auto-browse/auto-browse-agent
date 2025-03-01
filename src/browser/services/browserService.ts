import {
    connect,
    ExtensionTransport,
    Browser,
    Page
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";
import { getActiveTab, handleError } from "../utils";
import { BrowserConnection, BrowserServiceResponse } from "../types";

/**
 * Service class for managing browser operations using Puppeteer
 */
class BrowserService {
    /**
     * Get the title of the current active tab
     * @returns {Promise<BrowserServiceResponse>} Response with page title or error
     */
    async getPageTitle(): Promise<BrowserServiceResponse> {
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

        try
        {
            const transport = await ExtensionTransport.connectTab(tab.id);
            if (!transport)
            {
                throw new Error("Could not create browser transport");
            }

            const browser = await connect({ transport });
            if (!browser)
            {
                throw new Error("Could not connect to browser");
            }

            const pages = await browser.pages();
            const page = pages[0];
            if (!page)
            {
                throw new Error("Could not access browser page");
            }

            await page.setRequestInterception(false); // Ensure no interference
            return { browser: browser as Browser, page: page as Page };
        } catch (connectError)
        {
            console.error("Error connecting to browser:", connectError);
            throw new Error(`Browser connection failed: ${connectError instanceof Error ? connectError.message : String(connectError)}`);
        }
    }
}

export const browserService = new BrowserService();

import {
    connect,
    ExtensionTransport,
    Browser,
    Page
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";
import { BrowserConnection } from "./types";
import { getActiveTab } from "../utils";

/**
 * Base service class with shared connection management functionality
 */
class BaseService {

    private activeConnection: BrowserConnection | null = null;
    private connectionClosing: Promise<void> | null = null;


    /**
     * Gets an existing browser connection or creates a new one
     * @returns {Promise<BrowserConnection>} Browser and page connection
     */
    async getOrCreateConnection(): Promise<BrowserConnection> {
        // Wait for any pending connection closure
        if (this.connectionClosing)
        {
            await this.connectionClosing;
        }

        if (this.activeConnection)
        {
            return this.activeConnection;
        }

        // Small delay to ensure previous connection is fully cleaned up

        await new Promise(resolve => setTimeout(resolve, 100));

        this.activeConnection = await this.connectToActivePage();
        return this.activeConnection;
    }

    /**
     * Safely closes the current browser connection
     */
    async closeConnection(): Promise<void> {
        if (this.activeConnection)
        {
            this.connectionClosing = (async () => {
                try
                {
                    await this.activeConnection!.browser.disconnect();
                } catch (error)
                {
                    console.error("Error disconnecting browser:", error);
                } finally
                {
                    this.activeConnection = null;
                    this.connectionClosing = null;
                }
            })();
            await this.connectionClosing;
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

            const browser = await connect({ transport, defaultViewport: null });
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

export const baseService = new BaseService();

import {
    connect,
    ExtensionTransport,
    Browser,
    Page
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";
import { getActiveTab } from "../utils";
import { BrowserConnection } from "./types";
import { pageInfoService } from "./pageInfoService";
import { accessibilityService } from "./accessibilityService";
import { screenshotService } from "./screenshotService";
import { analysisService } from "./analysisService";
import { domService } from "./domService";
import { cookieService } from "./cookieService";
import { shadowDomService } from "./shadowDomService";
import { interactiveMapService } from "./interactiveMapService";
import { xpathService } from "./xpathService";
import { urlService } from "./urlService";
import { viewportService } from "./viewportService";
import { browserStateService } from "./browserStateService";

/**
 * Service class for managing browser operations using Puppeteer
 */
class BrowserService {
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

            // Get actual window dimensions
            const window = await chrome.windows.get(tab.windowId);
            await page.setViewport({
                width: window.width || 800,
                height: window.height || 600
            });

            return { browser: browser as Browser, page: page as Page };
        } catch (connectError)
        {
            console.error("Error connecting to browser:", connectError);
            throw new Error(`Browser connection failed: ${connectError instanceof Error ? connectError.message : String(connectError)}`);
        }
    }

    async getPageTitle() {
        return pageInfoService.getPageTitle();
    }

    async countElements() {
        return pageInfoService.countElements();
    }

    async getMetadata() {
        return pageInfoService.getMetadata();
    }

    async getAccessibilitySnapshot() {
        return accessibilityService.getAccessibilitySnapshot();
    }

    async takeScreenshot() {
        return screenshotService.takeScreenshot();
    }

    async analyzePage() {
        return analysisService.analyzePage();
    }

    async getDomTree() {
        return domService.getDomTree();
    }

    async getDomTreeWithBuild() {
        return domService.getDomTreeWithBuildDomTree();
    }

    async getDomTreeWithPageScript() {
        return domService.getDomTreeWithPageScript();
    }

    async analyzeCookieBanners() {
        return cookieService.analyzeCookieBanners();
    }

    async exploreShadowDom() {
        return shadowDomService.exploreShadowDom();
    }

    async getInteractiveMap() {
        return interactiveMapService.getInteractiveMap();
    }

    async getFormattedInteractiveMap() {
        return interactiveMapService.getFormattedInteractiveMap();
    }

    async getElementXpaths() {
        return xpathService.getElementXpaths();
    }

    async getCurrentUrl() {
        return urlService.getCurrentUrl();
    }

    async getViewportState() {
        return viewportService.getViewportState();
    }

    async getBrowserState() {
        return browserStateService.getBrowserState();
    }

    async getClickableElements() {
        return domService.getClickableElements();
    }

    async getElementTree() {
        return domService.getElementTree();
    }

    async getSelectorMap() {
        return domService.getSelectorMap();
    }

    async getTextMap() {
        return domService.getTextMap();
    }

    async getDomTreeWithNewScript() {
        return domService.getDomTreeWithNewScript();
    }
}

export const browserService = new BrowserService();

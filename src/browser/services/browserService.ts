import {
    connect,
    ExtensionTransport,
    Browser,
    Page
} from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";
import { getActiveTab, handleError } from "../utils";
import { domTraversalScript } from "../utils/domTraversal";
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

    /**
     * Count all elements on the current page
     * @returns {Promise<BrowserServiceResponse>} Response with element count
     */
    async countElements(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();

            const count = await page.evaluate(() => document.getElementsByTagName('*').length);

            await browser.disconnect();
            return {
                success: true,
                message: `Found ${count} elements on the page`
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Get page metadata
     * @returns {Promise<BrowserServiceResponse>} Response with page metadata
     */
    async getMetadata(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();

            const metadata = await page.evaluate(() => {
                const metaTags = document.getElementsByTagName('meta');
                const metadata: Record<string, string> = {};

                for (const tag of metaTags)
                {
                    const name = tag.getAttribute('name') || tag.getAttribute('property');
                    const content = tag.getAttribute('content');
                    if (name && content)
                    {
                        metadata[name] = content;
                    }
                }

                return metadata;
            });

            await browser.disconnect();
            return {
                success: true,
                message: `Page Metadata: ${JSON.stringify(metadata, null, 2)}`
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Analyze the current page structure
     * @returns {Promise<BrowserServiceResponse>} Response with page analysis
     */
    /**
     * Get accessibility snapshot of the current page using Puppeteer
     * @returns {Promise<BrowserServiceResponse>} Response with accessibility data
     */
    async getAccessibilitySnapshot(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();

            // Get Puppeteer's accessibility snapshot
            const snapshot = await page.accessibility.snapshot({
                interestingOnly: true // Do not Get all nodes, just interesting ones
            });

            await browser.disconnect();
            return {
                success: true,
                message: "Accessibility Snapshot",
                data: {
                    timestamp: new Date().toISOString(),
                    snapshot: snapshot
                }
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Take a screenshot of the current page
     * @returns {Promise<BrowserServiceResponse>} Response with screenshot data
     */
    async takeScreenshot(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();

            const screenshot = await page.screenshot({
                encoding: "base64",
                fullPage: true,
                type: "png"
            });

            await browser.disconnect();
            return {
                success: true,
                message: "Screenshot captured successfully",
                screenshot: `data:image/png;base64,${screenshot}`
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    async analyzePage(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();

            const analysis = await page.evaluate(() => {
                const stats = {
                    links: document.getElementsByTagName('a').length,
                    images: document.getElementsByTagName('img').length,
                    buttons: document.getElementsByTagName('button').length,
                    inputs: document.getElementsByTagName('input').length,
                    headings: {
                        h1: document.getElementsByTagName('h1').length,
                        h2: document.getElementsByTagName('h2').length,
                        h3: document.getElementsByTagName('h3').length
                    }
                };

                return stats;
            });

            await browser.disconnect();
            return {
                success: true,
                message: `Page Analysis:\n` +
                    `- Links: ${analysis.links}\n` +
                    `- Images: ${analysis.images}\n` +
                    `- Buttons: ${analysis.buttons}\n` +
                    `- Input fields: ${analysis.inputs}\n` +
                    `- Headings: H1 (${analysis.headings.h1}), H2 (${analysis.headings.h2}), H3 (${analysis.headings.h3})`
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Get DOM tree with visibility and interactivity info
     * @returns {Promise<BrowserServiceResponse>} Response with DOM tree data
     */
    async getDomTree(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();
            const tree = await page.evaluate(domTraversalScript);

            await browser.disconnect();
            return {
                success: true,
                message: "DOM Tree Snapshot",
                data: {
                    timestamp: new Date().toISOString(),
                    tree
                }
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Analyze cookie banners and consent UI
     * @returns {Promise<BrowserServiceResponse>} Response with cookie banner analysis
     */
    async analyzeCookieBanners(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();
            const tree = await page.evaluate(domTraversalScript);

            // Filter tree to find cookie/consent related elements
            function findCookieBanners(node: any): any[] {
                const results: any[] = [];

                const isCookieRelated =
                    node.attributes?.id?.toLowerCase().includes('cookie') ||
                    node.attributes?.id?.toLowerCase().includes('consent') ||
                    node.attributes?.class?.toLowerCase().includes('cookie') ||
                    node.attributes?.class?.toLowerCase().includes('consent') ||
                    node.attributes?.['aria-label']?.toLowerCase().includes('cookie');

                if (isCookieRelated && node.isInteractive)
                {
                    results.push(node);
                }

                if (node.children)
                {
                    for (const child of node.children)
                    {
                        results.push(...findCookieBanners(child));
                    }
                }

                return results;
            }

            const cookieBanners = findCookieBanners(tree);

            await browser.disconnect();
            return {
                success: true,
                message: `Found ${cookieBanners.length} cookie-related interactive elements`,
                data: {
                    timestamp: new Date().toISOString(),
                    elements: cookieBanners
                }
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Explore shadow DOM content
     * @returns {Promise<BrowserServiceResponse>} Response with shadow DOM data
     */
    async exploreShadowDom(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();
            const tree = await page.evaluate(domTraversalScript);

            // Filter tree to find shadow roots
            function findShadowRoots(node: any): any[] {
                const results: any[] = [];

                if (node.shadowRoot)
                {
                    results.push(node);
                }

                if (node.children)
                {
                    for (const child of node.children)
                    {
                        results.push(...findShadowRoots(child));
                    }
                }

                return results;
            }

            const shadowHosts = findShadowRoots(tree);

            await browser.disconnect();
            return {
                success: true,
                message: `Found ${shadowHosts.length} shadow DOM roots`,
                data: {
                    timestamp: new Date().toISOString(),
                    shadowHosts
                }
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Get map of all interactive elements
     * @returns {Promise<BrowserServiceResponse>} Response with interactive elements map
     */
    async getInteractiveMap(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();
            const tree = await page.evaluate(domTraversalScript);

            // Filter tree to find interactive elements with positions
            function findInteractiveElements(node: any): any[] {
                const results: any[] = [];

                if (node.isInteractive)
                {
                    results.push(node);
                }

                if (node.children)
                {
                    for (const child of node.children)
                    {
                        results.push(...findInteractiveElements(child));
                    }
                }

                return results;
            }

            const interactiveElements = findInteractiveElements(tree);

            await browser.disconnect();
            return {
                success: true,
                message: `Found ${interactiveElements.length} interactive elements`,
                data: {
                    timestamp: new Date().toISOString(),
                    elements: interactiveElements
                }
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Get XPaths for elements
     * @returns {Promise<BrowserServiceResponse>} Response with element XPaths
     */
    async getElementXpaths(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await this.connectToActivePage();
            const tree = await page.evaluate(domTraversalScript);

            // Extract all elements with their XPaths
            function collectXPaths(node: any): any[] {
                const results: any[] = [];

                if (node.xpath)
                {
                    results.push({
                        xpath: node.xpath,
                        tagName: node.tagName,
                        attributes: node.attributes,
                        isInteractive: node.isInteractive
                    });
                }

                if (node.children)
                {
                    for (const child of node.children)
                    {
                        results.push(...collectXPaths(child));
                    }
                }

                return results;
            }

            const elements = collectXPaths(tree);

            await browser.disconnect();
            return {
                success: true,
                message: `Found ${elements.length} elements with XPaths`,
                data: {
                    timestamp: new Date().toISOString(),
                    elements
                }
            };
        } catch (error)
        {
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}

export const browserService = new BrowserService();

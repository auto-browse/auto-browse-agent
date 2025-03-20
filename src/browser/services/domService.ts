import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";
import { domTraversalScript } from "../utils/domTraversal";
import { buildDomTreeScript } from "../utils/buildDomTree";
import { pageScriptDomTreeScript } from "../utils/page_script";

class DomService {
    getDomTree: () => Promise<BrowserServiceResponse>;

    constructor() {
        this.getDomTree = this.getDomTreeWithDomTraversal;
    }

    /**
     * Get DOM tree using original domTraversal implementation
     * @returns {Promise<BrowserServiceResponse>} Response with DOM tree data
     */
    async getDomTreeWithDomTraversal(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const tree = await page.evaluate(domTraversalScript);

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
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    /**
     * Get DOM tree using buildDomTree implementation with caching and performance metrics
     * @returns {Promise<BrowserServiceResponse>} Response with DOM tree data
     */
    async getDomTreeWithBuildDomTree(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const tree = await page.evaluate(buildDomTreeScript);

            return {
                success: true,
                message: "DOM Tree Snapshot (buildDomTree)",
                data: {
                    timestamp: new Date().toISOString(),
                    tree
                }
            };
        } catch (error)
        {
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    /**
     * Get DOM tree using page_script implementation focusing on interactive elements
     * @returns {Promise<BrowserServiceResponse>} Response with DOM tree data
     */
    async getDomTreeWithPageScript(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const tree = await page.evaluate(pageScriptDomTreeScript);

            return {
                success: true,
                message: "DOM Tree Snapshot (page_script)",
                data: {
                    timestamp: new Date().toISOString(),
                    tree
                }
            };
        } catch (error)
        {
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const domService = new DomService();

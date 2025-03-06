import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";
import { domTraversalScript } from "../utils/domTraversal";

class XpathService {
    /**
     * Get XPaths for elements
     * @returns {Promise<BrowserServiceResponse>} Response with element XPaths
     */
    async getElementXpaths(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
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
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const xpathService = new XpathService();

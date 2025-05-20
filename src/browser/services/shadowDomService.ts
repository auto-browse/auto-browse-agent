import { BrowserServiceResponse } from "../types";
import { baseService } from "./baseService";
import { domTraversalScript } from "../utils/domTraversal";

class ShadowDomService {
    /**
     * Explore shadow DOM content
     * @returns {Promise<BrowserServiceResponse>} Response with shadow DOM data
     */
    async exploreShadowDom(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await baseService.getOrCreateConnection();
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
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const shadowDomService = new ShadowDomService();

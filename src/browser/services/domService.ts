import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";
import { domTraversalScript } from "../utils/domTraversal";

class DomService {
    /**
     * Get DOM tree with visibility and interactivity info
     * @returns {Promise<BrowserServiceResponse>} Response with DOM tree data
     */
    async getDomTree(): Promise<BrowserServiceResponse> {
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
}

export const domService = new DomService();

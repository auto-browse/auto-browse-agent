import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";
import { domTraversalScript } from "../utils/domTraversal";

class CookieService {
    /**
     * Analyze cookie banners and consent UI
     * @returns {Promise<BrowserServiceResponse>} Response with cookie banner analysis
     */
    async analyzeCookieBanners(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
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
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const cookieService = new CookieService();

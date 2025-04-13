import { BrowserServiceResponse } from "../types";
//import { browserService } from "./browserService";
import { generateAriaTree, renderAriaTree } from "../snapshot/ariaSnapshot";


class AccessibilityService {
    /**
     * Get accessibility snapshot of the current page using Puppeteer
     * @returns {Promise<BrowserServiceResponse>} Response with accessibility data
     */
    async getAccessibilitySnapshot(): Promise<BrowserServiceResponse> {
        try
        {
            //const { page } = await browserService.getOrCreateConnection();


            const ariaTree = generateAriaTree(document.body, 1);
            const snapshot = renderAriaTree(ariaTree, {
                mode: 'raw',
                ref: true  // Enable element references in output
            });

            // Get Puppeteer's accessibility snapshot
            //const snapshot = await page.accessibility.snapshot({
            //    interestingOnly: true // Do not Get all nodes, just interesting ones
            //});

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
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const accessibilityService = new AccessibilityService();

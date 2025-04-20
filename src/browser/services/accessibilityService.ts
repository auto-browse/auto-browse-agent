import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";
import { injectedScriptSource } from "../utils/injectedScriptSource";

class AccessibilityService {
    /**
     * Get accessibility snapshot of the current page using Puppeteer
     * @returns {Promise<BrowserServiceResponse>} Response with accessibility data
     */
    async getAccessibilitySnapshot(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();

            // First inject our script into the page context
            await page.evaluate(`${injectedScriptSource}`);

            // Execute the script to get the accessibility snapshot
            const snapshotData = await page.evaluate(() => {
                // Use the globally exposed createAriaSnapshot function
                if (typeof window.createAriaSnapshot !== 'function')
                {
                    throw new Error('createAriaSnapshot function not available');
                }

                // Get the aria snapshot of the document body
                const snapshot = window.createAriaSnapshot(document.body, {
                    mode: 'raw',
                    ref: true  // Enable element references in output
                });

                return {
                    timestamp: new Date().toISOString(),
                    snapshot: snapshot
                };
            });

            return {
                success: true,
                message: "Accessibility Snapshot",
                data: snapshotData
            };
        } catch (error)
        {
            console.error("Error getting accessibility snapshot:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const accessibilityService = new AccessibilityService();

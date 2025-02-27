import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";

/**
 * Service for handling page highlighting operations
 */
class HighlightService {
    /**
     * Highlight all links on the current page
     * @returns {Promise<BrowserServiceResponse>} Response indicating success/failure
     */
    async highlightLinks(): Promise<BrowserServiceResponse> {
        try
        {
            const { browser, page } = await browserService.connectToActivePage();

            const result = await page.evaluate(() => {
                const links = document.querySelectorAll("a");
                links.forEach((link) => {
                    link.style.backgroundColor = "yellow";
                    link.style.border = "2px solid red";
                    link.style.color = "black";
                });
                return `Highlighted ${links.length} links`;
            });

            await browser.disconnect();
            return {
                success: true,
                message: result
            };
        } catch (error)
        {
            console.error("Error highlighting links:", error);
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const highlightService = new HighlightService();

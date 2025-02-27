import { browserService } from "./browserService";
import { handleError } from "../utils/browserUtils";
import { ServiceResponse } from "../types";

/**
 * Service class for managing DOM highlighting operations
 */
class HighlightService {
    /**
     * Highlight all links on the current page
     * @returns {Promise<ServiceResponse>} Response with success/failure message
     */
    async highlightLinks(): Promise<ServiceResponse> {
        try
        {
            const { browser, page } = await browserService.connectToActivePage();

            const result = await page.evaluate(() => {
                const links = document.querySelectorAll("a");
                links.forEach((link) => {
                    link.style.backgroundColor = "yellow";
                    link.style.border = "2px solid red";
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
            return handleError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}

export const highlightService = new HighlightService();

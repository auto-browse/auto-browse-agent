import { browserService } from "./browserService";
import { BrowserServiceResponse } from "../types";

/**
 * Service class for URL-related operations
 */
class UrlService {
    /**
     * Gets the current page URL
     * @returns {Promise<BrowserServiceResponse>} Response containing the current URL
     */
    async getCurrentUrl(): Promise<BrowserServiceResponse> {
        try
        {
            const connection = await browserService.getOrCreateConnection();
            const url = await connection.page.url();

            return {
                success: true,
                message: `Successfully retrieved current URL: ${url}`,
                data: { url }
            };
        } catch (error)
        {
            return {
                success: false,
                message: "Failed to get current URL",
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const urlService = new UrlService();

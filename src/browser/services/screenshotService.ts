import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";

class ScreenshotService {
    /**
     * Take a screenshot of the current page
     * @returns {Promise<BrowserServiceResponse>} Response with screenshot data
     */
    async takeScreenshot(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const screenshot = await page.screenshot({
                encoding: "base64",
                fullPage: true,
                type: "png"
            });

            return {
                success: true,
                message: "Screenshot captured successfully",
                screenshot: `data:image/png;base64,${screenshot}`
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

export const screenshotService = new ScreenshotService();

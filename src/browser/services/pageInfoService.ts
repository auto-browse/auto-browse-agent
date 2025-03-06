import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";

class PageInfoService {
    /**
     * Get the title of the current active tab
     * @returns {Promise<BrowserServiceResponse>} Response with page title or error
     */
    async getPageTitle(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const title = await page.title();

            return {
                success: true,
                message: `Current page title: ${title}`
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

    /**
     * Count all elements on the current page
     * @returns {Promise<BrowserServiceResponse>} Response with element count
     */
    async countElements(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const count = await page.evaluate(() => document.getElementsByTagName('*').length);

            return {
                success: true,
                message: `Found ${count} elements on the page`
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

    /**
     * Get page metadata
     * @returns {Promise<BrowserServiceResponse>} Response with page metadata
     */
    async getMetadata(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const metadata = await page.evaluate(() => {
                const metaTags = document.getElementsByTagName('meta');
                const metadata: Record<string, string> = {};

                for (const tag of metaTags)
                {
                    const name = tag.getAttribute('name') || tag.getAttribute('property');
                    const content = tag.getAttribute('content');
                    if (name && content)
                    {
                        metadata[name] = content;
                    }
                }

                return metadata;
            });

            return {
                success: true,
                message: `Page Metadata: ${JSON.stringify(metadata, null, 2)}`
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

export const pageInfoService = new PageInfoService();

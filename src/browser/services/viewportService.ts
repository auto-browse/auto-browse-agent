import { browserService } from "./browserService";
import { BrowserServiceResponse } from "../types";

interface ViewportState {
    pixelsAbove: number;
    pixelsBelow: number;
    width: number;
    height: number;
}

/**
 * Service class for viewport-related operations
 */
class ViewportService {
    /**
     * Gets the current viewport state
     * @returns {Promise<BrowserServiceResponse>} Response containing viewport metrics
     */
    async getViewportState(): Promise<BrowserServiceResponse> {
        try
        {
            const connection = await browserService.getOrCreateConnection();
            const metrics = await connection.page.evaluate(() => {
                const docHeight = Math.max(
                    document.body.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.clientHeight,
                    document.documentElement.scrollHeight,
                    document.documentElement.offsetHeight
                );
                const viewportHeight = window.innerHeight;
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                return {
                    scrollTop,
                    docHeight,
                    viewportHeight,
                    viewportWidth: window.innerWidth
                };
            });

            const viewportState: ViewportState = {
                pixelsAbove: metrics.scrollTop,
                pixelsBelow: metrics.docHeight - metrics.viewportHeight - metrics.scrollTop,
                width: metrics.viewportWidth,
                height: metrics.viewportHeight
            };

            return {
                success: true,
                message: `Viewport metrics:
- Width: ${viewportState.width}px
- Height: ${viewportState.height}px
- Pixels above viewport: ${viewportState.pixelsAbove}px
- Pixels below viewport: ${viewportState.pixelsBelow}px`,
                data: viewportState
            };
        } catch (error)
        {
            return {
                success: false,
                message: "Failed to get viewport metrics",
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const viewportService = new ViewportService();

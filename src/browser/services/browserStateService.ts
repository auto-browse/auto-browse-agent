import { browserService } from "./browserService";
import { BrowserServiceResponse } from "../types";

interface BrowserState {
    url: string;
    title: string;
    viewport: {
        width: number;
        height: number;
        pixelsAbove: number;
        pixelsBelow: number;
    } | null;
    interactiveMap: any[] | null;
    accessibility: any | null;
}

// Parameters for customizing browser state retrieval
export interface GetBrowserStateOptions {
    includeUrl?: boolean;
    includeTitle?: boolean;
    includeViewport?: boolean;
    includeInteractiveMap?: boolean;
    includeAccessibility?: boolean;
}

// Default options
const DEFAULT_OPTIONS: GetBrowserStateOptions = {
    includeUrl: true,
    includeTitle: true,
    includeViewport: true,
    includeInteractiveMap: true,
    includeAccessibility: false
};

/**
 * Service class for getting combined browser state
 */
class BrowserStateService {
    /**
     * Gets the current combined state of the browser
     * @param {GetBrowserStateOptions} options - Options to customize which parts of the state to retrieve
     * @returns {Promise<BrowserServiceResponse>} Response containing the requested browser state
     */
    async getBrowserState(options: GetBrowserStateOptions = DEFAULT_OPTIONS): Promise<BrowserServiceResponse> {
        try
        {
            // Apply defaults for any missing options
            const opts = { ...DEFAULT_OPTIONS, ...options };

            // Initialize state object with null values
            const state: BrowserState = {
                url: '',
                title: '',
                viewport: null,
                interactiveMap: null,
                accessibility: null
            };

            // Only retrieve the requested state components
            if (opts.includeUrl)
            {
                const urlResponse = await browserService.getCurrentUrl();
                if (!urlResponse.success)
                {
                    throw new Error("Failed to get URL");
                }
                state.url = urlResponse.data.url;
            }

            if (opts.includeTitle)
            {
                const titleResponse = await browserService.getPageTitle();
                if (!titleResponse.success)
                {
                    throw new Error("Failed to get page title");
                }
                state.title = titleResponse.message;
            }

            if (opts.includeViewport)
            {
                const viewportResponse = await browserService.getViewportState();
                if (!viewportResponse.success)
                {
                    throw new Error("Failed to get viewport state");
                }
                state.viewport = viewportResponse.data;
            }

            if (opts.includeInteractiveMap)
            {
                const interactiveMapResponse = await browserService.getClickableElements({});
                if (!interactiveMapResponse.success)
                {
                    throw new Error("Failed to get interactive map");
                }
                state.interactiveMap = interactiveMapResponse.data.elements;
            }

            if (opts.includeAccessibility)
            {
                const accessibilityResponse = await browserService.getAccessibilitySnapshot();
                if (!accessibilityResponse.success)
                {
                    throw new Error("Failed to get accessibility snapshot");
                }
                state.accessibility = accessibilityResponse.data.snapshot;
            }

            // Build the formatted message based on what was retrieved
            let message = "# Browser State\n\n";

            if (opts.includeUrl)
            {
                message += "## URL\n\n`" + state.url + "`\n\n";
            }

            if (opts.includeTitle)
            {
                message += "## Page Title\n\n" + state.title + "\n\n";
            }

            if (opts.includeViewport && state.viewport)
            {
                message += "## Viewport Metrics\n\n" +
                    `- Width: ${state.viewport.width}px\n` +
                    `- Height: ${state.viewport.height}px\n` +
                    `- Pixels above: ${state.viewport.pixelsAbove}px\n` +
                    `- Pixels below: ${state.viewport.pixelsBelow}px\n\n`;
            }

            if (opts.includeInteractiveMap && state.interactiveMap)
            {
                message += `## Interactive Elements (${state.interactiveMap.length})\n\n`;

                if (state.interactiveMap.length === 0)
                {
                    message += 'empty page';
                } else
                {
                    /*const viewportInfo = state.viewport;
                    if (viewportInfo && viewportInfo.pixelsAbove > 0)
                    {
                        message += `... ${viewportInfo.pixelsAbove} pixels above - scroll or extract content to see more ...\n`;
                    } else
                    {
                        message += '[Start of page]\n';
                    }

                    message += state.interactiveMap.map(element => element.formattedOutput).join('\n\n');

                    if (viewportInfo && viewportInfo.pixelsBelow > 0)
                    {
                        message += `\n... ${viewportInfo.pixelsBelow} pixels below - scroll or extract content to see more ...`;
                    } else
                    {
                        message += '\n[End of page]';
                    }*/
                }

                message += "\n\n";
            }

            if (opts.includeAccessibility && state.accessibility)
            {
                message += "## Accessibility Tree\n\n```yaml\n" + state.accessibility + "\n```\n\n";
            }
            //console.log("Browser state retrieved successfully:", message);
            return {
                success: true,
                message: message,
                data: state
            };
        } catch (error)
        {
            return {
                success: false,
                message: "Failed to get browser state",
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
}

export const browserStateService = new BrowserStateService();

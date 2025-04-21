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
    };
    interactiveMap: any[];
    accessibility: any;
}

/**
 * Service class for getting combined browser state
 */
class BrowserStateService {
    /**
     * Gets the current combined state of the browser
     * @returns {Promise<BrowserServiceResponse>} Response containing all browser state
     */
    async getBrowserState(): Promise<BrowserServiceResponse> {
        try
        {
            // Get states sequentially to prevent connection conflicts
            const urlResponse = await browserService.getCurrentUrl();
            const titleResponse = await browserService.getPageTitle();
            const viewportResponse = await browserService.getViewportState();
            const interactiveMapResponse = await browserService.getFormattedInteractiveMap();
            const accessibilityResponse = await browserService.getAccessibilitySnapshot();

            // Check if any requests failed
            if (!urlResponse.success || !titleResponse.success || !viewportResponse.success ||
                !interactiveMapResponse.success || !accessibilityResponse.success)
            {
                throw new Error("One or more state requests failed");
            }

            const state: BrowserState = {
                url: urlResponse.data.url,
                title: titleResponse.message,
                viewport: viewportResponse.data,
                interactiveMap: interactiveMapResponse.data.elements,
                accessibility: "" //accessibilityResponse.data.snapshot
            };

            return {
                success: true,
                message: `# Browser State

## URL

\`${state.url}\`


## Page Title

${state.title}


## Viewport Metrics

- Width: ${state.viewport.width}px
- Height: ${state.viewport.height}px
- Pixels above: ${state.viewport.pixelsAbove}px
- Pixels below: ${state.viewport.pixelsBelow}px


## Interactive Elements (${state.interactiveMap.length})

${state.interactiveMap.length === 0 ? 'empty page' : `${state.viewport.pixelsAbove > 0
                            ? `... ${state.viewport.pixelsAbove} pixels above - scroll or extract content to see more ...\n`
                            : '[Start of page]\n'
                        }${state.interactiveMap.map(element => element.formattedOutput).join('\n\n')}${state.viewport.pixelsBelow > 0
                            ? `\n... ${state.viewport.pixelsBelow} pixels below - scroll or extract content to see more ...`
                            : '\n[End of page]'
                        }`}


## Accessibility Tree

\`\`\`json
${JSON.stringify(state.accessibility, null, 2)}
\`\`\`

`,
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

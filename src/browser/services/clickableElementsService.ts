import { buildDomTreeScript } from '../utils/buildDomTree'; // Import the existing DOM tree script
import { browserService } from './browserService';
import { DomScriptResult, DomNodeData } from './types'; // CORRECT: Import DomNodeData
import { BrowserServiceResponse } from '../types'; // Import BrowserServiceResponse

// Define the structure for the simplified clickable element info
export interface ClickableElementInfo {
    index: number;
    tagName: string;
    attributes: Record<string, string>;
    xpath: string;
    autobrowseId: string;
    isVisible: boolean;
    isInViewport: boolean;
    // Add other relevant serializable fields from DomScriptNodeData if needed
}

// Define the structure for the data part of the response
export interface ClickableElementsData {
    timestamp: string;
    elements: ClickableElementInfo[];
}

export interface ClickableElementsParams {
    // Parameters are currently hardcoded in the script, but kept for potential future use
    // e.g., doHighlightElements?: boolean;
    debugMode?: boolean;
}

// Removed old ClickableElementResult interface

export class ClickableElementsService {
    // Update return type to remove generic argument as BrowserServiceResponse is not generic
    async getClickableElements(_params: ClickableElementsParams): Promise<BrowserServiceResponse> {
        if (!buildDomTreeScript)
        {
            console.error("!!! buildDomTreeScript is not defined or empty !!!");
            // Return error response instead of throwing
            return {
                success: false,
                message: "Clickable elements script not defined.",
                error: new Error("Clickable elements script not defined.")
            };
        }

        try
        {
            // Get connection using browserService
            const { page } = await browserService.getOrCreateConnection();

            console.log("--- Executing clickable elements script ---");
            // Execute the script in the page context
            const result = await page.evaluate(buildDomTreeScript);
            const scriptResult = result as DomScriptResult; // Cast the raw result

            console.log("--- Raw result from page.evaluate (casted) ---");
            console.log("Result rootId:", scriptResult?.rootId);
            console.log("Result map keys:", scriptResult?.map ? Object.keys(scriptResult.map).length : 'N/A');
            console.log("---------------------------------------");

            // Directly process the scriptResult.map
            const clickableElements: ClickableElementInfo[] = [];
            const nodeDataMap = scriptResult?.map ?? {};

            for (const nodeId in nodeDataMap)
            {
                const nodeData: DomNodeData = nodeDataMap[nodeId]; // Use correct type DomNodeData

                // Check if it's an element with a highlightIndex
                if (nodeData.tagName && nodeData.highlightIndex !== undefined && nodeData.highlightIndex !== null)
                {
                    const elementInfo: ClickableElementInfo = {
                        index: nodeData.highlightIndex,
                        tagName: nodeData.tagName,
                        attributes: nodeData.attributes ?? {},
                        xpath: nodeData.xpath ?? '',
                        autobrowseId: nodeData.attributes?.['autobrowse-highlight-id'] ?? '',
                        isVisible: nodeData.isVisible ?? false,
                        isInViewport: nodeData.isInViewport ?? false,
                        // Add other fields from nodeData here if needed
                    };
                    clickableElements.push(elementInfo);
                }
            }

            // Sort elements by index
            clickableElements.sort((a, b) => a.index - b.index);

            // Return the simplified, serializable structure
            return {
                success: true,
                message: `Found ${clickableElements.length} clickable elements.`,
                data: {
                    timestamp: new Date().toISOString(),
                    elements: clickableElements
                }
            };

        } catch (error)
        {
            console.error("Error executing or processing clickable elements script:", error);
            // Return error response
            return {
                success: false,
                message: `Failed to get clickable elements: ${error instanceof Error ? error.message : String(error)}`,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    // Removed _convertNodeToHistoryElement method as it's no longer needed
    // Removed _constructDomTree method as it's no longer needed
}

// Export a singleton instance
export const clickableElementsService = new ClickableElementsService();

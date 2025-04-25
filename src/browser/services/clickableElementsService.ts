//import { BrowserConnection } from '../types';
import { buildDomTreeScript } from '../utils/buildDomTree'; // Import the existing DOM tree script
import { browserService } from './browserService';

export interface ClickableElementsParams {
    // Define any parameters needed for the script, similar to the reference
    // e.g., doHighlightElements?: boolean;
    debugMode?: boolean;
}

export interface ClickableElementResult {
    // Define the expected structure of the result from the script
    elements: any[]; // Replace 'any' with a more specific type if possible
}

export class ClickableElementsService {
    // Remove connection parameter, get connection inside the method
    async getClickableElements(_params: ClickableElementsParams): Promise<ClickableElementResult> {
        if (!buildDomTreeScript)
        {
            console.error("!!! buildDomTreeScript is not defined or empty !!!");
            throw new Error("Clickable elements script not defined.");
        }

        // Removed args constant as it's no longer used

        try
        {
            // Get connection using browserService
            const { page } = await browserService.getOrCreateConnection();

            console.log("--- Executing clickable elements script ---");
            console.log("Script defined:", !!buildDomTreeScript);
            console.log("Script length:", buildDomTreeScript?.length);
            console.log("Script (first 100 chars):", buildDomTreeScript ? buildDomTreeScript.substring(0, 100) + "..." : "SCRIPT IS EMPTY/UNDEFINED");

            // Execute the script in the page context
            const result = await page.evaluate(buildDomTreeScript);

            console.log("--- Raw result from page.evaluate (no args passed) ---");
            console.log("Result type:", typeof result);
            console.log("Result value:", JSON.stringify(result, null, 2));
            console.log("---------------------------------------");

            // TODO: Potentially process or validate the result
            // console.log("Clickable elements result:", JSON.stringify(result, null, 2)); // Keep original log for comparison if needed
            return result as ClickableElementResult; // Still returning raw result for now
        } catch (error)
        {
            console.error("Error executing clickable elements script:", error);
            throw new Error(`Failed to get clickable elements: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

// Export a singleton instance
export const clickableElementsService = new ClickableElementsService();

import { buildDomTreeScript } from '../utils/buildDomTree'; // Import the existing DOM tree script
import { browserService } from './browserService';
import { DomScriptResult, DomNodeData } from './types'; // Import DomNodeData
import { BrowserServiceResponse } from '../types'; // Import BrowserServiceResponse

// Attributes to include in the markdown output, similar to interactiveMapService
const INTERACTIVE_ELEMENT_ATTRIBUTES: string[] = [
    'autobrowse-highlight-id',
    'title',
    'type',
    'name',
    'role',
    'tabindex',
    'aria-label',
    'placeholder',
    'value',
    'alt',
    'aria-expanded',
    'aria_name' // Note: This might be specific to the other script's output, verify if needed
];

// Define the structure for the data part of the response
export interface ClickableElementsData {
    timestamp: string;
    elements: {
        index: number;
        tagName: string;
        attributesStr: string;
        textContent: string;
        formattedOutput: string;
    }[];
}

export interface ClickableElementsParams {
    // Parameters are currently hardcoded in the script, but kept for potential future use
    // e.g., doHighlightElements?: boolean;
    debugMode?: boolean;
}

export class ClickableElementsService {
    // Return type remains BrowserServiceResponse, but the structure within data changes
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


            // Execute the script in the page context
            const result = await page.evaluate(buildDomTreeScript);
            const scriptResult = result as DomScriptResult; // Cast the raw result


            const nodeDataMap = scriptResult?.map ?? {};
            const formattedElements: {
                index: number;
                tagName: string;
                attributesStr: string;
                textContent: string;
                formattedOutput: string;
            }[] = [];

            for (const nodeIdStr in nodeDataMap)
            {
                const nodeId = parseInt(nodeIdStr, 10);
                const nodeData: DomNodeData = nodeDataMap[nodeId];

                // Check if it's an element with a highlightIndex
                if (nodeData.tagName && nodeData.highlightIndex !== undefined && nodeData.highlightIndex !== null)
                {
                    // 1. Get Inner Text *** THIS IS THE CRITICAL CALL ***
                    const innerText = this._getTextForNode(nodeId, nodeDataMap);

                    // 2. Filter and Format Attributes
                    const validAttributes = INTERACTIVE_ELEMENT_ATTRIBUTES
                        .map((attr: string) => ({ key: attr, value: nodeData.attributes?.[attr] })) // Ensure type for attr
                        .filter((pair: { key: string; value: string | undefined; }) => pair.value && typeof pair.value === 'string' && pair.value.trim() !== ''); // Ensure type for pair

                    const attributesStr = validAttributes
                        .map((pair: { key: string; value: string | undefined; }) => `${pair.key}="${pair.value}"`) // Ensure type for pair, ensure quotes around value
                        .join(' ');

                    // 3. Create formatted element
                    const tagNameLower = nodeData.tagName.toLowerCase();
                    const element = {
                        index: nodeData.highlightIndex,
                        tagName: tagNameLower,
                        attributesStr: attributesStr ? ' ' + attributesStr : '',
                        textContent: innerText,
                        formattedOutput: `${nodeData.highlightIndex}[:]<${tagNameLower}${attributesStr ? ' ' + attributesStr : ''}>${innerText}</${tagNameLower}>`
                    };

                    formattedElements.push(element);
                }
            }

            // Sort elements by index
            formattedElements.sort((a, b) => a.index - b.index);


            return {
                success: true,
                message: `Found ${formattedElements.length} clickable elements with formatted output`,
                data: {
                    timestamp: new Date().toISOString(),
                    elements: formattedElements
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

    /**
     * Recursively collects text content for a given node from the flat map,
     * stopping if another interactive element is encountered.
     * @param nodeId The ID of the starting node.
     * @param nodeDataMap The complete map of node data from the script.
     * @returns The collected text content.
     */
    private _getTextForNode(nodeId: number, nodeDataMap: { [id: number]: DomNodeData; }): string {
        const textParts: string[] = [];
        const visited = new Set<number>(); // Prevent infinite loops in case of cycles

        function collectTextRecursive(currentId: number) {
            if (visited.has(currentId))
            {
                return;
            }
            visited.add(currentId);

            const currentNodeData = nodeDataMap[currentId];
            if (!currentNodeData)
            {
                return; // Node not found
            }

            // Stop if we hit another interactive element (different from the starting one)
            if (currentId !== nodeId && currentNodeData.highlightIndex !== undefined && currentNodeData.highlightIndex !== null)
            {
                return;
            }

            // If it's a text node, add its text
            if (currentNodeData.type === 'TEXT_NODE' && currentNodeData.text)
            {
                textParts.push(currentNodeData.text.trim());
            } else if (currentNodeData.children)
            {
                // If it's an element node with children, recurse
                for (const childId of currentNodeData.children)
                {
                    collectTextRecursive(childId);
                }
            }
        }

        // Start collecting text from the children of the initial node
        const startNodeData = nodeDataMap[nodeId];
        if (startNodeData?.children)
        {
            for (const childId of startNodeData.children)
            {
                collectTextRecursive(childId);
            }
        }

        // Join collected parts, filter empty strings, and trim final result
        return textParts.filter(part => part.length > 0).join(' ').trim();
    }
}

// Export a singleton instance
export const clickableElementsService = new ClickableElementsService();

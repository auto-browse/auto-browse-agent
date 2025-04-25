import { buildDomTreeScript } from '../utils/buildDomTree'; // Import the existing DOM tree script
import { browserService } from './browserService';
import { DomScriptResult, DomNode, DomElementNode, DomTextNode, SelectorMap, DomHistoryElement } from './types'; // Import new types

export interface ClickableElementsParams {
    // Parameters are currently hardcoded in the script, but kept for potential future use
    // e.g., doHighlightElements?: boolean;
    debugMode?: boolean;
}

export interface ClickableElementResult {
    scriptResult: DomScriptResult;
    elementTree: DomElementNode | null; // Still has cycles
    selectorMap: SelectorMap; // Still has cycles
    historyElementMap: Record<number, DomHistoryElement>; // Serializable map
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
            const scriptResult = result as DomScriptResult; // Cast the raw result

            console.log("--- Raw result from page.evaluate (casted) ---");
            console.log("Result type:", typeof scriptResult);
            // Avoid logging the full map in production, can be very large
            console.log("Result rootId:", scriptResult?.rootId);
            console.log("Result map keys:", scriptResult?.map ? Object.keys(scriptResult.map).length : 'N/A');
            console.log("---------------------------------------");

            // Post-process the script result
            const { elementTree, selectorMap } = this._constructDomTree(scriptResult);

            // Create the serializable history element map
            const historyElementMap: Record<number, DomHistoryElement> = {};
            for (const indexStr in selectorMap)
            {
                const index = parseInt(indexStr, 10);
                if (!isNaN(index))
                {
                    historyElementMap[index] = this._convertNodeToHistoryElement(selectorMap[index]);
                }
            }

            return { scriptResult, elementTree, selectorMap, historyElementMap };
        } catch (error)
        {
            console.error("Error executing or processing clickable elements script:", error);
            throw new Error(`Failed to get clickable elements: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Converts a constructed DomElementNode into a serializable DomHistoryElement.
     */
    private _convertNodeToHistoryElement(node: DomElementNode): DomHistoryElement {
        return {
            tagName: node.tagName,
            xpath: node.xpath,
            highlightIndex: node.highlightIndex,
            attributes: node.attributes,
            shadowRoot: node.shadowRoot ?? false,
            // cssSelector: node.cssSelector, // Add if available/needed
            // Coordinates/viewport info could be added here if available on node
        };
    }

    /**
     * Constructs the hierarchical DOM tree and selector map from the script result.
     * Mimics the logic of the Python _construct_dom_tree method.
     */
    private _constructDomTree(scriptResult: DomScriptResult): { elementTree: DomElementNode | null; selectorMap: SelectorMap; } {
        const { rootId, map: nodeDataMap } = scriptResult;
        const selectorMap: SelectorMap = {};
        const constructedNodeCache = new Map<number, DomNode>(); // Cache to handle cycles and reuse nodes

        const buildNode = (nodeId: number): DomNode | null => {
            // 1. Check cache
            if (constructedNodeCache.has(nodeId))
            {
                return constructedNodeCache.get(nodeId)!;
            }

            // 2. Get raw data
            const nodeData = nodeDataMap[nodeId];
            if (!nodeData)
            {
                console.warn(`Node data not found for ID: ${nodeId}`);
                return null;
            }

            let constructedNode: DomNode | null = null;

            // 3. Parse node data (similar to Python _parse_node)
            if (nodeData.type === 'TEXT_NODE')
            {
                const textNode: DomTextNode = {
                    nodeType: 'TEXT_NODE',
                    text: nodeData.text ?? '',
                    isVisible: nodeData.isVisible ?? false,
                    parent: null, // Will be set by parent
                };
                constructedNode = textNode;
                // Store in cache *before* returning (though less critical for text nodes)
                constructedNodeCache.set(nodeId, constructedNode);

            } else if (nodeData.tagName)
            {
                // It's an element node
                const elementNode: DomElementNode = {
                    nodeType: 'ELEMENT_NODE',
                    tagName: nodeData.tagName,
                    attributes: nodeData.attributes ?? {},
                    xpath: nodeData.xpath ?? '',
                    children: [], // Will be populated below
                    isVisible: nodeData.isVisible ?? false,
                    isInteractive: nodeData.isInteractive,
                    isTopElement: nodeData.isTopElement,
                    isInViewport: nodeData.isInViewport,
                    highlightIndex: nodeData.highlightIndex,
                    shadowRoot: nodeData.shadowRoot,
                    parent: null, // Will be set by parent
                };
                constructedNode = elementNode;
                // Store in cache *before* processing children to handle recursion/cycles
                constructedNodeCache.set(nodeId, constructedNode);

                // 4. Process children recursively
                if (nodeData.children)
                {
                    for (const childId of nodeData.children)
                    {
                        const childNode = buildNode(childId);
                        if (childNode)
                        {
                            childNode.parent = elementNode; // Set parent link
                            elementNode.children.push(childNode);
                        }
                    }
                }

                // 5. Populate selectorMap
                if (elementNode.highlightIndex !== undefined && elementNode.highlightIndex !== null)
                {
                    selectorMap[elementNode.highlightIndex] = elementNode;
                }
            } else
            {
                console.warn(`Invalid node data structure for ID: ${nodeId}`, nodeData);
                return null; // Skip invalid nodes
            }

            return constructedNode;
        };

        // Start building from the root
        const elementTree = buildNode(rootId);

        // Ensure the root is an ElementNode, otherwise something went wrong
        if (elementTree && elementTree.nodeType === 'ELEMENT_NODE')
        {
            return { elementTree: elementTree as DomElementNode, selectorMap };
        } else
        {
            console.error("Failed to construct valid element tree root.");
            return { elementTree: null, selectorMap };
        }
    }
}

// Export a singleton instance
export const clickableElementsService = new ClickableElementsService();

import { BrowserServiceResponse } from "../types";
import { browserService } from "./browserService";
import { domTraversalScript } from "../utils/domTraversal";

const INTERACTIVE_ELEMENT_ATTRIBUTES = [
    'browser-user-highlight-id',
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
    'aria_name'
];

class InteractiveMapService {
    /**
     * Get map of all interactive elements
     * @returns {Promise<BrowserServiceResponse>} Response with interactive elements map
     */
    async getInteractiveMap(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const tree = await page.evaluate(domTraversalScript);

            // Filter tree to find interactive elements with positions
            function findInteractiveElements(node: any): any[] {
                const results: any[] = [];

                if (node.isInteractive)
                {
                    results.push(node);
                }

                if (node.children)
                {
                    for (const child of node.children)
                    {
                        results.push(...findInteractiveElements(child));
                    }
                }

                return results;
            }

            const interactiveElements = findInteractiveElements(tree);

            return {
                success: true,
                message: `Found ${interactiveElements.length} interactive elements`,
                data: {
                    timestamp: new Date().toISOString(),
                    elements: interactiveElements
                }
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
     * Get text content until the next interactive element
     * @param node Current node to process
     * @param maxDepth Maximum depth to traverse (-1 for unlimited)
     * @returns Text content until next interactive element
     */
    private getTextUntilNextInteractive(node: any, maxDepth: number = -1): string {
        const textParts: string[] = [];

        function collectText(currentNode: any, currentDepth: number): void {
            if (maxDepth !== -1 && currentDepth > maxDepth)
            {
                return;
            }

            // Skip this branch if we hit another interactive element (except the current node)
            if (currentNode !== node && currentNode.isInteractive)
            {
                return;
            }

            // If it's a text node (checking via presence of text property and absence of children)
            if (currentNode.text && !currentNode.children)
            {
                textParts.push(currentNode.text);
            } else if (currentNode.children)
            {
                for (const child of currentNode.children)
                {
                    collectText(child, currentDepth + 1);
                }
            }
        }

        collectText(node, 0);
        return textParts.join(' ').trim();
    }

    /**
     * Get formatted interactive map with HTML-style output format
     * @returns {Promise<BrowserServiceResponse>} Response with formatted interactive elements
     */
    async getFormattedInteractiveMap(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const tree = await page.evaluate(domTraversalScript);

            const elements: any[] = [];

            // Process nodes recursively
            const processNode = (node: any) => {
                if (node.isInteractive && node.highlightIndex !== undefined)
                {
                    // Get attributes as HTML string
                    const validAttributes = INTERACTIVE_ELEMENT_ATTRIBUTES
                        .filter(attr => {
                            const value = node.attributes?.[attr];
                            return value && typeof value === 'string' && value.trim() !== '';
                        });

                    // Build attributes string in HTML format
                    const attributesStr = validAttributes
                        .map(attr => `${attr}="${node.attributes[attr]}"`)
                        .join(' ');

                    // Get associated text content
                    const textContent = this.getTextUntilNextInteractive(node);

                    const element = {
                        index: node.highlightIndex,
                        tagName: node.tagName.toLowerCase(),
                        attributesStr: attributesStr ? ' ' + attributesStr : '',
                        textContent: textContent,
                        // Format as: index[:]<tag attrs>text</tag>
                        formattedOutput: `${node.highlightIndex}[:]<${node.tagName.toLowerCase()}${attributesStr ? ' ' + attributesStr : ''}>${textContent}</${node.tagName.toLowerCase()}>`
                    };

                    elements.push(element);
                }

                // Process children
                if (node.children)
                {
                    for (const child of node.children)
                    {
                        processNode(child);
                    }
                }
            };

            // Start processing from root
            processNode(tree);

            // Sort elements by highlight index
            elements.sort((a, b) => a.index - b.index);

            return {
                success: true,
                message: `Found ${elements.length} interactive elements with formatted output`,
                data: {
                    timestamp: new Date().toISOString(),
                    elements: elements
                }
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

export const interactiveMapService = new InteractiveMapService();

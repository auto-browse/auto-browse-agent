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
     * Get formatted interactive map with markdown-formatted attributes
     * @returns {Promise<BrowserServiceResponse>} Response with formatted interactive elements
     */
    async getFormattedInteractiveMap(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const tree = await page.evaluate(domTraversalScript);

            // Filter tree to find interactive elements with positions and format their attributes
            function findInteractiveElements(node: any): any[] {
                const results: any[] = [];

                if (node.isInteractive)
                {
                    // Get values for our specific attributes
                    const validAttributes = INTERACTIVE_ELEMENT_ATTRIBUTES
                        .filter(attr => {
                            const value = node.attributes?.[attr];
                            return value && typeof value === 'string' && value.trim() !== '';
                        })
                        .map(attr => ({
                            name: attr,
                            value: node.attributes[attr]
                        }));

                    if (validAttributes.length > 0)
                    {
                        const formattedAttributes = validAttributes
                            .map(({ name, value }) => `**${name}**: ${value}`)
                            .join('\n');

                        results.push({
                            xpath: node.xpath,
                            tagName: node.tagName,
                            formattedAttributes,
                            // Only include the specific attributes we want
                            attributes: Object.fromEntries(
                                validAttributes.map(({ name, value }) => [name, value])
                            )
                        });
                    }
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
                message: `Found ${interactiveElements.length} interactive elements with formatted attributes`,
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
}

export const interactiveMapService = new InteractiveMapService();

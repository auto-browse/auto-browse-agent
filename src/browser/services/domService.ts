import { BrowserServiceResponse, DOMState, DOMElementNode, DOMTextNode } from "../types";
import { browserService } from "./browserService";
import { domTraversalScript } from "../utils/domTraversal";
import { buildDomTreeScript } from "../utils/buildDomTree";
import { pageScriptDomTreeScript } from "../utils/page_script";

class DomService {
    getDomTree: () => Promise<BrowserServiceResponse>;

    constructor() {
        this.getDomTree = this.getDomTreeWithDomTraversal;
    }

    /**
     * Get DOM tree using original domTraversal implementation
     * @returns {Promise<BrowserServiceResponse>} Response with DOM tree data
     */
    async getDomTreeWithDomTraversal(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const tree = await page.evaluate(domTraversalScript);

            return {
                success: true,
                message: "DOM Tree Snapshot",
                data: {
                    timestamp: new Date().toISOString(),
                    tree
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
     * Get DOM tree using buildDomTree implementation with caching and performance metrics
     * @returns {Promise<BrowserServiceResponse>} Response with DOM tree data
     */
    async getDomTreeWithBuildDomTree(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const tree = await page.evaluate(buildDomTreeScript);

            return {
                success: true,
                message: "DOM Tree Snapshot (buildDomTree)",
                data: {
                    timestamp: new Date().toISOString(),
                    tree
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
     * Get DOM tree using page_script implementation focusing on interactive elements
     * @returns {Promise<BrowserServiceResponse>} Response with DOM tree data
     */
    async getDomTreeWithPageScript(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const tree = await page.evaluate(pageScriptDomTreeScript);

            return {
                success: true,
                message: "DOM Tree Snapshot (page_script)",
                data: {
                    timestamp: new Date().toISOString(),
                    tree
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
     * Get clickable elements using buildDomTree implementation
     * @returns {Promise<BrowserServiceResponse>} Response with clickable elements data
     */
    async getClickableElements(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const rawTree = await page.evaluate(buildDomTreeScript);

            // Process the raw tree to create both hierarchical DOM structure and selector map
            const elementTree = this.processElementTree(rawTree);
            const selectorMap = this.processSelectorMap(rawTree, elementTree);

            // Build the complete DOM state
            const domState: DOMState = {
                element_tree: elementTree,
                selector_map: selectorMap
            };

            // Prepare a serializable version of the DOM state to avoid circular references
            const serializableDomState = this.makeSerializable(domState);

            return {
                success: true,
                message: "Clickable Elements Snapshot",
                data: {
                    timestamp: new Date().toISOString(),
                    tree: serializableDomState
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
     * Get just the DOM element tree without selector information
     * @returns {Promise<BrowserServiceResponse>} Response with DOM element tree
     */
    async getElementTree(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const rawTree = await page.evaluate(buildDomTreeScript);

            // Process just the element tree
            const elementTree = this.processElementTree(rawTree);

            // Serialize the element tree for response
            const serializableTree = this.serializeElement(elementTree);

            return {
                success: true,
                message: "DOM Element Tree",
                data: {
                    timestamp: new Date().toISOString(),
                    elementTree: serializableTree
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
     * Get just the selector map of interactive elements
     * @returns {Promise<BrowserServiceResponse>} Response with selector map
     */
    async getSelectorMap(): Promise<BrowserServiceResponse> {
        try
        {
            const { page } = await browserService.getOrCreateConnection();
            const rawTree = await page.evaluate(buildDomTreeScript);

            // First need to process the element tree for parent-child relationships
            const elementTree = this.processElementTree(rawTree);

            // Then extract only the selector map
            const selectorMap = this.processSelectorMap(rawTree, elementTree);

            // Create a serializable version of the selector map
            const serializableMap: Record<number, any> = {};
            for (const [key, element] of Object.entries(selectorMap))
            {
                serializableMap[Number(key)] = this.serializeElement(element as DOMElementNode);
            }

            return {
                success: true,
                message: "Interactive Elements Selector Map",
                data: {
                    timestamp: new Date().toISOString(),
                    selectorMap: serializableMap
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
     * Converts the DOM state to a serializable format by removing circular references
     * @param domState The DOM state to serialize
     * @returns A serializable version of the DOM state
     */
    private makeSerializable(domState: DOMState): any {
        // Create a serializable copy of the selector map
        const serializableMap: Record<number, any> = {};

        for (const [key, element] of Object.entries(domState.selector_map))
        {
            serializableMap[Number(key)] = this.serializeElement(element as DOMElementNode);
        }

        // Return a serializable version of the DOM state
        return {
            element_tree: this.serializeElement(domState.element_tree),
            selector_map: serializableMap
        };
    }

    /**
     * Recursively converts a DOM element to a serializable format
     * @param node The DOM node to serialize
     * @returns A serializable version of the node
     */
    private serializeElement(node: DOMElementNode | DOMTextNode): any {
        if ('type' in node && node.type === 'TEXT_NODE')
        {
            // Text node - return without parent field to avoid circular reference
            return {
                type: node.type,
                text: node.text,
                is_visible: node.is_visible
            };
        }

        // Element node
        const elementNode = node as DOMElementNode;
        const serializableNode: any = {
            tag_name: elementNode.tag_name,
            xpath: elementNode.xpath,
            attributes: elementNode.attributes,
            is_visible: elementNode.is_visible,
            is_interactive: elementNode.is_interactive,
            is_top_element: elementNode.is_top_element,
            is_in_viewport: elementNode.is_in_viewport,
            shadow_root: elementNode.shadow_root,
        };

        // Add optional properties if they exist
        if (elementNode.highlight_index !== undefined)
        {
            serializableNode.highlight_index = elementNode.highlight_index;
        }

        if (elementNode.viewport_info)
        {
            serializableNode.viewport_info = elementNode.viewport_info;
        }

        // Recursively process children
        if (elementNode.children && elementNode.children.length > 0)
        {
            serializableNode.children = elementNode.children.map(child =>
                this.serializeElement(child)
            );
        } else
        {
            serializableNode.children = [];
        }

        return serializableNode;
    }

    /**
     * Process the raw DOM tree data to create a hierarchical element tree
     * @param rawTree The raw DOM tree data from the browser
     * @returns The processed DOM element tree
     */
    private processElementTree(rawTree: any): DOMElementNode {
        const { rootId, map } = rawTree;
        if (!rootId || !map)
        {
            throw new Error('Invalid DOM tree structure');
        }

        const node_map: { [key: string]: DOMElementNode | DOMTextNode; } = {};

        // First pass: create all nodes
        for (const [id, nodeData] of Object.entries(map))
        {
            const node = this.parseNode(nodeData);
            if (node)
            {
                node_map[id] = node;
            }
        }

        // Second pass: build parent-child relationships
        for (const [id, nodeData] of Object.entries(map))
        {
            const parentNode = node_map[id];
            // Type check nodeData to ensure it has the children property
            const nodeChildren = (nodeData as any).children;

            if (parentNode && 'children' in parentNode && nodeChildren)
            {
                for (const childId of nodeChildren as string[])
                {
                    const childNode = node_map[childId];
                    if (childNode)
                    {
                        (parentNode as DOMElementNode).children.push(childNode);
                        childNode.parent = parentNode as DOMElementNode;
                    }
                }
            }
        }

        const rootNode = node_map[String(rootId)];
        if (!rootNode || !('tag_name' in rootNode))
        {
            console.error("Raw tree:", rawTree);
            throw new Error('Failed to process DOM tree: no valid root node found');
        }

        return rootNode as DOMElementNode;
    }

    /**
     * Process the raw DOM tree data to create a selector map of interactive elements
     * @param rawTree The raw DOM tree data from the browser
     * @param elementTree The already processed element tree (for efficiency)
     * @returns The selector map of interactive elements
     */
    private processSelectorMap(rawTree: any, elementTree: DOMElementNode): { [key: number]: DOMElementNode; } {
        const { map } = rawTree;
        if (!map)
        {
            throw new Error('Invalid DOM tree structure');
        }

        const selector_map: { [key: number]: DOMElementNode; } = {};

        // Simple helper function to find nodes with highlight indexes
        const findHighlightedNodes = (node: DOMElementNode | DOMTextNode) => {
            if ('type' in node && node.type === 'TEXT_NODE')
            {
                return; // Skip text nodes
            }

            const elementNode = node as DOMElementNode;

            // Add to selector map if the node has a highlight index
            if (elementNode.highlight_index !== undefined)
            {
                selector_map[elementNode.highlight_index] = elementNode;
            }

            // Recursively process children
            if (elementNode.children)
            {
                for (const child of elementNode.children)
                {
                    findHighlightedNodes(child);
                }
            }
        };

        // Start the recursive search
        findHighlightedNodes(elementTree);

        return selector_map;
    }

    private parseNode(nodeData: any): DOMElementNode | DOMTextNode | null {
        if (!nodeData)
        {
            return null;
        }

        // Process text nodes
        if (nodeData.type === 'TEXT_NODE')
        {
            return {
                type: 'TEXT_NODE',
                text: nodeData.text,
                is_visible: nodeData.isVisible,
                parent: undefined // Changed from null to undefined to match type requirements
            };
        }

        // Process viewport info if it exists
        let viewport_info = undefined;
        if (nodeData.viewport)
        {
            viewport_info = {
                width: nodeData.viewport.width,
                height: nodeData.viewport.height
            };
        }

        // Create element node
        return {
            tag_name: nodeData.tagName,
            xpath: nodeData.xpath,
            attributes: nodeData.attributes || {},
            children: [],
            is_visible: nodeData.isVisible || false,
            is_interactive: nodeData.isInteractive || false,
            is_top_element: nodeData.isTopElement || false,
            is_in_viewport: nodeData.isInViewport || false,
            highlight_index: nodeData.highlightIndex,
            shadow_root: nodeData.shadowRoot || false,
            parent: undefined, // Changed from null to undefined to match type requirements
            viewport_info: viewport_info
        };
    }
}

export const domService = new DomService();

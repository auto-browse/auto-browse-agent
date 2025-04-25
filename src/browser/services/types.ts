import { Browser, Page } from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";

export interface BrowserServiceResponse {
    success: boolean;
    message: string;
    data?: any;
    error?: Error;
    screenshot?: string;
}

export interface BrowserConnection {
    browser: Browser;
    page: Page;
}

// --- DOM Analysis Types ---

// Raw data structure for nodes returned by the buildDomTree script
export interface DomNodeData {
    type?: 'TEXT_NODE'; // Present for text nodes
    text?: string; // Text content for text nodes
    tagName?: string; // Tag name for element nodes
    attributes?: Record<string, string>; // Attributes for element nodes
    xpath?: string; // XPath for element nodes
    children?: number[]; // Array of child node IDs for element nodes
    isVisible?: boolean; // Visibility status
    isInteractive?: boolean; // Interactivity status
    isTopElement?: boolean; // Topmost element status
    isInViewport?: boolean; // Viewport status
    highlightIndex?: number; // Highlight index if interactive and visible
    shadowRoot?: boolean; // Indicates if the element has a shadow root
}

// Interface for the script's direct output
export interface DomScriptResult {
    rootId: number;
    map: { [id: number]: DomNodeData; };
    perfMetrics?: any; // Optional performance metrics
}

// Base interface for constructed DOM nodes
export interface DomBaseNode {
    parent: DomElementNode | null;
    isVisible: boolean;
}

// Interface for constructed element nodes
export interface DomElementNode extends DomBaseNode {
    nodeType: 'ELEMENT_NODE';
    tagName: string;
    attributes: Record<string, string>;
    xpath: string;
    children: DomNode[];
    isInteractive?: boolean;
    isTopElement?: boolean;
    isInViewport?: boolean;
    highlightIndex?: number;
    shadowRoot?: boolean;
}

// Interface for constructed text nodes
export interface DomTextNode extends DomBaseNode {
    nodeType: 'TEXT_NODE';
    text: string;
}

// Union type for any constructed node
export type DomNode = DomElementNode | DomTextNode;

// Type alias for the selector map (highlightIndex -> DomElementNode)
export type SelectorMap = Record<number, DomElementNode>;

// Serializable representation of an element, inspired by Python's DOMHistoryElement
export interface DomHistoryElement {
    tagName: string;
    xpath: string;
    highlightIndex?: number; // Use optional if it might be missing
    attributes: Record<string, string>;
    shadowRoot: boolean;
    cssSelector?: string; // Optional based on Python
    // Coordinates/viewport info omitted for now
}

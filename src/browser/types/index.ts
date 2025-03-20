import type { Browser as PuppeteerBrowser, Page as PuppeteerPage } from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";

export interface BrowserConnection {
    browser: PuppeteerBrowser;
    page: PuppeteerPage;
}

export interface BrowserServiceResponse {
    success: boolean;
    message: string;
    error?: Error;
    screenshot?: string; // Base64 encoded image data
    data?: any; // For structured response data like accessibility snapshot
}

export interface ChromeTab {
    id?: number;
    title?: string;
    url?: string;
    active: boolean;
    windowId: number;
}

export interface DOMBaseNode {
    is_visible: boolean;
    parent?: DOMElementNode;
}

export interface DOMTextNode extends DOMBaseNode {
    type: 'TEXT_NODE';
    text: string;
}

export interface DOMElementNode extends DOMBaseNode {
    tag_name: string;
    xpath: string;
    attributes: { [key: string]: string; };
    children: (DOMElementNode | DOMTextNode)[];
    is_interactive: boolean;
    is_top_element: boolean;
    is_in_viewport: boolean;
    highlight_index?: number;
    shadow_root?: boolean;
    viewport_info?: {
        width: number;
        height: number;
    };
}

export interface DOMState {
    element_tree: DOMElementNode;
    selector_map: { [key: number]: DOMElementNode; };
}

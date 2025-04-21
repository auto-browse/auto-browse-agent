//import { BrowserServiceResponse } from "../../browser/types";

export enum ActionType {
    GET_BROWSER_SCREENSHOT = "GET_BROWSER_SCREENSHOT",
    GET_ACCESSIBILITY_SNAPSHOT = "GET_ACCESSIBILITY_SNAPSHOT",
    GET_DOM_TREE = "GET_DOM_TREE",
    GET_PAGE_INFO = "GET_PAGE_INFO",
    GET_COOKIES = "GET_COOKIES",
    GET_COOKIE_BANNERS = "GET_COOKIE_BANNERS",
    GET_INTERACTIVE_MAP = "GET_INTERACTIVE_MAP",
    GET_FORMATTED_INTERACTIVE_MAP = "GET_FORMATTED_INTERACTIVE_MAP",
    GET_SHADOW_DOM = "GET_SHADOW_DOM",
    HIGHLIGHT_ELEMENTS = "HIGHLIGHT_ELEMENTS",
    // Restoring missing action types
    TEST_CONNECTION = "TEST_CONNECTION",
    GET_PAGE_TITLE = "GET_PAGE_TITLE",
    HIGHLIGHT_LINKS = "HIGHLIGHT_LINKS",
    COUNT_ELEMENTS = "COUNT_ELEMENTS",
    GET_METADATA = "GET_METADATA",
    ANALYZE_PAGE = "ANALYZE_PAGE",
    ANALYZE_COOKIE_BANNERS = "ANALYZE_COOKIE_BANNERS",
    EXPLORE_SHADOW_DOM = "EXPLORE_SHADOW_DOM",
    GET_ELEMENT_XPATHS = "GET_ELEMENT_XPATHS",
    GET_VIEWPORT = "GET_VIEWPORT",
    GET_BROWSER_STATE = "GET_BROWSER_STATE",
    GET_CURRENT_URL = "GET_CURRENT_URL",
    TAKE_SCREENSHOT = "TAKE_SCREENSHOT"
}

export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    action?: ActionType;
    response?: MessageResponse;
    isProcessing?: boolean;
}

export interface MessageRequest {
    action?: ActionType;
    message?: string;
    selector?: string;
    url?: string;
}

export interface MessageResponse {
    success: boolean;
    message: string;
    screenshot?: string;
    error?: Error;
    data?: any;
    nodeUpdates?: NodeUpdate[];
}

export interface NodeUpdate {
    node: string;
    status: 'active' | 'completed' | 'idle';
    content?: string;
    timestamp: Date;
}

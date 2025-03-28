import { BrowserServiceResponse } from "../../browser/types";

export enum ActionType {
    TEST_CONNECTION = "TEST_CONNECTION",
    GET_PAGE_TITLE = "GET_PAGE_TITLE",
    HIGHLIGHT_LINKS = "HIGHLIGHT_LINKS",
    ANALYZE_PAGE = "ANALYZE_PAGE",
    COUNT_ELEMENTS = "COUNT_ELEMENTS",
    GET_METADATA = "GET_METADATA",
    TAKE_SCREENSHOT = "TAKE_SCREENSHOT",
    GET_ACCESSIBILITY_SNAPSHOT = "GET_ACCESSIBILITY_SNAPSHOT",
    GET_DOM_TREE = "GET_DOM_TREE",
    ANALYZE_COOKIE_BANNERS = "ANALYZE_COOKIE_BANNERS",
    EXPLORE_SHADOW_DOM = "EXPLORE_SHADOW_DOM",
    GET_INTERACTIVE_MAP = "GET_INTERACTIVE_MAP",
    GET_FORMATTED_INTERACTIVE_MAP = "GET_FORMATTED_INTERACTIVE_MAP",
    GET_ELEMENT_XPATHS = "GET_ELEMENT_XPATHS",
    GET_CURRENT_URL = "GET_CURRENT_URL",
    GET_VIEWPORT = "GET_VIEWPORT",
    GET_BROWSER_STATE = "GET_BROWSER_STATE",
    GET_DOM_TREE_WITH_BUILD = "GET_DOM_TREE_WITH_BUILD",
    GET_DOM_TREE_WITH_PAGE_SCRIPT = "GET_DOM_TREE_WITH_PAGE_SCRIPT",
    GET_CLICKABLE_ELEMENTS = "GET_CLICKABLE_ELEMENTS",
    GET_ELEMENT_TREE = "GET_ELEMENT_TREE",
    GET_SELECTOR_MAP = "GET_SELECTOR_MAP",
    GET_TEXT_MAP = "GET_TEXT_MAP",
    GET_DOM_TREE_WITH_NEW_SCRIPT = "GET_DOM_TREE_WITH_NEW_SCRIPT"
}

export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: Date;
    action?: ActionType;
    response?: BrowserServiceResponse;
}

export interface MessageRequest {
    action: ActionType;
    payload?: any;
}

export interface MessageResponse extends BrowserServiceResponse {
    // Extends BrowserServiceResponse to maintain consistency
    // Can add messaging-specific fields here if needed
}

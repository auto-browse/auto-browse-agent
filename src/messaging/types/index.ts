import { BrowserServiceResponse } from "../../browser/types";

export enum ActionType {
    TEST_CONNECTION = "TEST_CONNECTION",
    GET_PAGE_TITLE = "GET_PAGE_TITLE",
    HIGHLIGHT_LINKS = "HIGHLIGHT_LINKS"
}

export interface MessageRequest {
    action: ActionType;
    payload?: any;
}

export interface MessageResponse extends BrowserServiceResponse {
    // Extends BrowserServiceResponse to maintain consistency
    // Can add messaging-specific fields here if needed
}

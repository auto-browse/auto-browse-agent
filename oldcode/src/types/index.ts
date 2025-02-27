import type { Browser as PuppeteerBrowser, Page as PuppeteerPage } from "puppeteer-core/lib/esm/puppeteer/puppeteer-core-browser.js";

export interface ServiceResponse {
    success: boolean;
    message: string;
    error?: Error;
}

export interface BrowserConnection {
    browser: PuppeteerBrowser;
    page: PuppeteerPage;
}

// Chrome Extension Types
export interface ChromeTab {
    id?: number;
    title?: string;
    url?: string;
    active: boolean;
    windowId: number;
}

// Message Types
export interface MessageRequest {
    action: ActionType;
    payload?: any;
}

// Action Types
export enum ActionType {
    TEST_CONNECTION = "TEST_CONNECTION",
    GET_PAGE_TITLE = "GET_PAGE_TITLE",
    HIGHLIGHT_LINKS = "HIGHLIGHT_LINKS"
}

export interface MessageResponse {
    success: boolean;
    message: string;
    error?: Error;
}

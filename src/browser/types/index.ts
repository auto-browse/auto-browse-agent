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

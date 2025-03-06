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

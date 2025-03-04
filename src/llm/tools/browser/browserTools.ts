import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { browserService } from "../../../browser/services/browserService";

// Type definitions
export type GotoParams = {
    url: string;
};

export type ClickParams = {
    selector: string;
};

export type FillParams = {
    selector: string;
    value: string;
};

// Function to create and initialize tools
export function createBrowserTools() {
    // Schema definitions
    const gotoSchema = z.object({
        url: z.string().url("Invalid URL format")
    });

    const clickSchema = z.object({
        selector: z.string().min(1, "Selector cannot be empty")
    });

    const fillSchema = z.object({
        selector: z.string().min(1, "Selector cannot be empty"),
        value: z.string().min(1, "Value cannot be empty")
    });

    // Tool creation
    const gotoTool = new DynamicStructuredTool({
        name: "goto",
        description: "Navigate to a specified URL",
        schema: gotoSchema,
        func: async ({ url }: GotoParams) => {
            try
            {
                const { browser, page } = await browserService.connectToActivePage();
                await page.goto(url);
                await browser.disconnect();
                return `Successfully navigated to ${url}`;
            } catch (error)
            {
                return `Error navigating to ${url}: ${error instanceof Error ? error.message : String(error)}`;
            }
        }
    });

    const clickTool = new DynamicStructuredTool({
        name: "click",
        description: "Click an element on the page using a CSS selector",
        schema: clickSchema,
        func: async ({ selector }: ClickParams) => {
            try
            {
                const { browser, page } = await browserService.connectToActivePage();
                await page.waitForSelector(selector);
                await page.click(selector);
                await browser.disconnect();
                return `Successfully clicked element at ${selector}`;
            } catch (error)
            {
                return `Error clicking element at ${selector}: ${error instanceof Error ? error.message : String(error)}`;
            }
        }
    });

    const fillTool = new DynamicStructuredTool({
        name: "fill",
        description: "Fill an input field on the page using a CSS selector",
        schema: fillSchema,
        func: async ({ selector, value }: FillParams) => {
            try
            {
                const { browser, page } = await browserService.connectToActivePage();
                await page.waitForSelector(selector);
                await page.type(selector, value);
                await browser.disconnect();
                return `Successfully filled element at ${selector} with provided value`;
            } catch (error)
            {
                return `Error filling element at ${selector}: ${error instanceof Error ? error.message : String(error)}`;
            }
        }
    });

    // Return tool collection
    return [gotoTool, clickTool, fillTool];
}

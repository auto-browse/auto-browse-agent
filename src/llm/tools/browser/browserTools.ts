import { tool } from "@langchain/core/tools";
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
    const gotoTool = tool(
        async (input: GotoParams): Promise<string> => {
            try
            {
                const { page } = await browserService.getOrCreateConnection();
                await page.goto(input.url);
                return `Successfully navigated to ${input.url}`;
            } catch (error)
            {
                return `Error navigating to ${input.url}: ${error instanceof Error ? error.message : String(error)}`;
            } finally
            {
                await browserService.closeConnection();
            }
        },
        {
            name: "goto",
            description: "Navigate to a specified URL",
            schema: gotoSchema,
        }
    );

    const clickTool = tool(
        async (input: ClickParams): Promise<string> => {
            try
            {
                const { page } = await browserService.getOrCreateConnection();
                await page.waitForSelector(input.selector);
                await page.click(input.selector);
                return `Successfully clicked element at ${input.selector}`;
            } catch (error)
            {
                return `Error clicking element at ${input.selector}: ${error instanceof Error ? error.message : String(error)}`;
            } finally
            {
                await browserService.closeConnection();
            }
        },
        {
            name: "click",
            description: "Click an element on the page using a CSS selector",
            schema: clickSchema,
        }
    );

    const fillTool = tool(
        async (input: FillParams): Promise<string> => {
            try
            {
                const { page } = await browserService.getOrCreateConnection();
                await page.waitForSelector(input.selector);
                await page.type(input.selector, input.value);
                return `Successfully filled element at ${input.selector} with provided value`;
            } catch (error)
            {
                return `Error filling element at ${input.selector}: ${error instanceof Error ? error.message : String(error)}`;
            } finally
            {
                await browserService.closeConnection();
            }
        },
        {
            name: "fill",
            description: "Fill an input field on the page using a CSS selector",
            schema: fillSchema,
        }
    );

    // Return tool collection
    return [gotoTool, clickTool, fillTool];
}

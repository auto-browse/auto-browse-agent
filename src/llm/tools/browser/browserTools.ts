import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { browserService } from "../../../browser/services/browserService";
import { browserStateService, GetBrowserStateOptions } from "../../../browser/services/browserStateService";
// Type definitions
export type NavigationParams = {};

export type ScrollParams = {
    pixels?: number;
};

export type ScrollToTextParams = {
    text: string;
};

export type ExtractContentParams = {};

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

export type GetBrowserStateParams = {
    includeUrl?: boolean;
    includeTitle?: boolean;
    includeViewport?: boolean;
    includeInteractiveMap?: boolean;
    includeAccessibility?: boolean;
};

// Function to create and initialize tools
export function createBrowserTools() {
    // Schema definitions
    const navigationSchema = z.object({});

    const scrollSchema = z.object({
        pixels: z.number().optional().default(100)
    });

    const scrollToTextSchema = z.object({
        text: z.string().min(1, "Search text cannot be empty")
    });

    const extractContentSchema = z.object({});

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

    const getBrowserStateSchema = z.object({
        includeUrl: z.boolean().optional().default(true),
        includeTitle: z.boolean().optional().default(true),
        includeViewport: z.boolean().optional().default(true),
        includeInteractiveMap: z.boolean().optional().default(true),
        includeAccessibility: z.boolean().optional().default(false)
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

    const goBackTool = tool(
        async (_input: NavigationParams): Promise<string> => {
            try
            {
                const { page } = await browserService.getOrCreateConnection();
                await page.goBack();
                return "Successfully navigated back";
            } catch (error)
            {
                return `Error navigating back: ${error instanceof Error ? error.message : String(error)}`;
            } finally
            {
                await browserService.closeConnection();
            }
        },
        {
            name: "goBack",
            description: "Go back to the previous page in browser history",
            schema: navigationSchema,
        }
    );

    const goForwardTool = tool(
        async (_input: NavigationParams): Promise<string> => {
            try
            {
                const { page } = await browserService.getOrCreateConnection();
                await page.goForward();
                return "Successfully navigated forward";
            } catch (error)
            {
                return `Error navigating forward: ${error instanceof Error ? error.message : String(error)}`;
            } finally
            {
                await browserService.closeConnection();
            }
        },
        {
            name: "goForward",
            description: "Go forward to the next page in browser history",
            schema: navigationSchema,
        }
    );

    const scrollUpTool = tool(
        async (input: ScrollParams): Promise<string> => {
            try
            {
                const { page } = await browserService.getOrCreateConnection();
                await page.evaluate((pixels) => {
                    window.scrollBy(0, -pixels);
                }, input.pixels || 100);
                return `Successfully scrolled up ${input.pixels || 100} pixels`;
            } catch (error)
            {
                return `Error scrolling up: ${error instanceof Error ? error.message : String(error)}`;
            } finally
            {
                await browserService.closeConnection();
            }
        },
        {
            name: "scrollUp",
            description: "Scroll the page up by a specified number of pixels (default 100)",
            schema: scrollSchema,
        }
    );

    const scrollDownTool = tool(
        async (input: ScrollParams): Promise<string> => {
            try
            {
                const { page } = await browserService.getOrCreateConnection();
                await page.evaluate((pixels) => {
                    window.scrollBy(0, pixels);
                }, input.pixels || 100);
                return `Successfully scrolled down ${input.pixels || 100} pixels`;
            } catch (error)
            {
                return `Error scrolling down: ${error instanceof Error ? error.message : String(error)}`;
            } finally
            {
                await browserService.closeConnection();
            }
        },
        {
            name: "scrollDown",
            description: "Scroll the page down by a specified number of pixels (default 100)",
            schema: scrollSchema,
        }
    );

    const scrollToTextTool = tool(
        async (input: ScrollToTextParams): Promise<string> => {
            try
            {
                const { page } = await browserService.getOrCreateConnection();
                const found = await page.evaluate((searchText) => {
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT,
                        null
                    );

                    let node;
                    while (node = walker.nextNode())
                    {
                        if (node.textContent?.includes(searchText))
                        {
                            const element = node.parentElement;
                            if (element)
                            {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                return true;
                            }
                        }
                    }
                    return false;
                }, input.text);

                return found
                    ? `Successfully scrolled to text "${input.text}"`
                    : `Text "${input.text}" not found on page`;
            } catch (error)
            {
                return `Error scrolling to text: ${error instanceof Error ? error.message : String(error)}`;
            } finally
            {
                await browserService.closeConnection();
            }
        },
        {
            name: "scrollToText",
            description: "Find and scroll to specific text on the page",
            schema: scrollToTextSchema,
        }
    );

    const extractContentTool = tool(
        async (_input: ExtractContentParams): Promise<string> => {
            try
            {
                const { page } = await browserService.getOrCreateConnection();
                const content = await page.evaluate(() => {
                    const walker = document.createTreeWalker(
                        document.body,
                        NodeFilter.SHOW_TEXT,
                        null
                    );

                    let text = '';
                    let node;
                    while (node = walker.nextNode())
                    {
                        const trimmed = node.textContent?.trim() || '';
                        if (trimmed)
                        {
                            text += trimmed + '\n';
                        }
                    }
                    return text.trim();
                });

                return content || "No content found on page";
            } catch (error)
            {
                return `Error extracting content: ${error instanceof Error ? error.message : String(error)}`;
            } finally
            {
                await browserService.closeConnection();
            }
        },
        {
            name: "extractContent",
            description: "Extract all visible text content from the current page",
            schema: extractContentSchema,
        }
    );

    const getBrowserStateTool = tool(
        async (input: GetBrowserStateParams): Promise<string> => {
            try
            {
                const options: GetBrowserStateOptions = {
                    includeUrl: input.includeUrl,
                    includeTitle: input.includeTitle,
                    includeViewport: input.includeViewport,
                    includeInteractiveMap: input.includeInteractiveMap,
                    includeAccessibility: input.includeAccessibility
                };

                const response = await browserStateService.getBrowserState(options);
                if (response.success)
                {
                    return response.message;
                } else
                {
                    return `Failed to get browser state: ${response.error?.message || 'Unknown error'}`;
                }
            } catch (error)
            {
                return `Error getting browser state: ${error instanceof Error ? error.message : String(error)}`;
            }
        },
        {
            name: "getBrowserState",
            description: "Get information about the current browser state. You can customize which parts to include: URL, title, viewport metrics, interactive elements, and accessibility tree.",
            schema: getBrowserStateSchema,
        }
    );

    // Return tool collection
    return [
        gotoTool,
        clickTool,
        fillTool,
        goBackTool,
        goForwardTool,
        scrollUpTool,
        scrollDownTool,
        scrollToTextTool,
        extractContentTool,
        getBrowserStateTool
    ];
}

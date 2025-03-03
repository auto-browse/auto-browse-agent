import { browserService } from "@/browser/services/browserService";
import { NavigationOptions, ClickOptions, FillOptions } from "@/browser/types";
import { BaseTool } from "../base/baseTool";

export class GotoTool extends BaseTool {
    name = "goto";
    description = "Navigate to a specific URL in the current browser tab";
    parameters = {
        type: "object" as const,
        properties: {
            url: {
                type: "string",
                description: "The URL to navigate to"
            },
            waitUntil: {
                type: "string",
                description: "Navigation condition to wait for (load, domcontentloaded, networkidle0, networkidle2)"
            }
        },
        required: ["url"]
    };

    async execute(args: { url: string; waitUntil?: NavigationOptions["waitUntil"]; }) {
        const response = await browserService.goto(args.url, {
            waitUntil: args.waitUntil || "networkidle0"
        });
        return this.formatBrowserResponse(response);
    }
}

export class FillTool extends BaseTool {
    name = "fill";
    description = "Fill a form field or input element with text";
    parameters = {
        type: "object" as const,
        properties: {
            selector: {
                type: "string",
                description: "CSS selector for the element to fill"
            },
            value: {
                type: "string",
                description: "Text to type into the element"
            },
            delay: {
                type: "number",
                description: "Delay between keystrokes in milliseconds"
            }
        },
        required: ["selector", "value"]
    };

    async execute(args: { selector: string; value: string; delay?: number; }) {
        const options: FillOptions = {};
        if (args.delay) options.delay = args.delay;

        const response = await browserService.fill(args.selector, args.value, options);
        return this.formatBrowserResponse(response);
    }
}

export class ClickTool extends BaseTool {
    name = "click";
    description = "Click an element on the page";
    parameters = {
        type: "object" as const,
        properties: {
            selector: {
                type: "string",
                description: "CSS selector for the element to click"
            },
            button: {
                type: "string",
                description: "Mouse button to use (left, right, middle)"
            },
            clickCount: {
                type: "number",
                description: "Number of times to click"
            },
            delay: {
                type: "number",
                description: "Delay between clicks in milliseconds"
            }
        },
        required: ["selector"]
    };

    async execute(args: { selector: string; button?: string; clickCount?: number; delay?: number; }) {
        const options: ClickOptions = {};
        if (args.button) options.button = args.button as ClickOptions["button"];
        if (args.clickCount) options.clickCount = args.clickCount;
        if (args.delay) options.delay = args.delay;

        const response = await browserService.click(args.selector, options);
        return this.formatBrowserResponse(response);
    }
}

// Export all browser tools
export const browserTools = {
    goto: new GotoTool(),
    fill: new FillTool(),
    click: new ClickTool()
} as const;

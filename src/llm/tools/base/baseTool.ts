import { BrowserServiceResponse } from "@/browser/types";

export interface ToolResult {
    success: boolean;
    message: string;
    data?: any;
}

export interface Tool {
    name: string;
    description: string;
    parameters: {
        type: "object";
        properties: Record<string, {
            type: string;
            description: string;
        }>;
        required?: string[];
    };
    execute: (args: any) => Promise<ToolResult>;
}

export abstract class BaseTool implements Tool {
    abstract name: string;
    abstract description: string;
    abstract parameters: {
        type: "object";
        properties: Record<string, {
            type: string;
            description: string;
        }>;
        required?: string[];
    };

    abstract execute(args: Record<string, any>): Promise<ToolResult>;

    protected formatBrowserResponse(response: BrowserServiceResponse): ToolResult {
        return {
            success: response.success,
            message: response.message,
            data: response.data || response.screenshot
        };
    }
}

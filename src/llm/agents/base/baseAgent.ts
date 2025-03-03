import { Tool, ToolResult } from "@/llm/tools/base/baseTool";

export interface AgentConfig {
    name: string;
    description: string;
    systemPrompt: string;
}

export interface AgentMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export abstract class BaseAgent {
    private tools: Map<string, Tool> = new Map();

    constructor(protected config: AgentConfig) { }

    /**
     * Get agent's configuration
     */
    getConfig(): AgentConfig {
        return this.config;
    }

    /**
     * Register a tool with this agent
     */
    registerTool(tool: Tool): void {
        this.tools.set(tool.name, tool);
    }

    /**
     * Register multiple tools at once
     */
    registerTools(tools: Tool[]): void {
        tools.forEach(tool => this.registerTool(tool));
    }

    /**
     * Execute a tool by name
     */
    protected async executeTool(name: string, args: Record<string, any>): Promise<ToolResult> {
        const tool = this.tools.get(name);
        if (!tool)
        {
            return {
                success: false,
                message: `Tool '${name}' not found`
            };
        }

        try
        {
            return await tool.execute(args);
        } catch (error)
        {
            return {
                success: false,
                message: error instanceof Error ? error.message : String(error)
            };
        }
    }

    /**
     * Get list of available tools and their descriptions
     */
    protected getToolDescriptions(): string {
        const descriptions: string[] = [];
        this.tools.forEach((tool, name) => {
            descriptions.push(`Tool: ${name}
Description: ${tool.description}
Parameters: ${JSON.stringify(tool.parameters, null, 2)}
`);
        });
        return descriptions.join("\n");
    }

    /**
     * Initialize the agent
     */
    abstract initialize(): Promise<void>;

    /**
     * Process a message and generate a response
     */
    abstract processMessage(message: AgentMessage): Promise<AgentMessage>;
}

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { BaseAgent, AgentMessage } from "../base/baseAgent";
import { browserTools } from "@/llm/tools/browser/browserTools";
import { getOpenAIChat } from "@/llm/config/openai";
import { agentPrompts } from "@/llm/supervisor/config/prompts";

export class ResearcherAgent extends BaseAgent {
    private chat: ChatOpenAI | undefined;

    constructor() {
        super(agentPrompts.researcher);
        this.registerTools(Object.values(browserTools));
    }

    async initialize(): Promise<void> {
        this.chat = await getOpenAIChat();
    }

    async processMessage(message: AgentMessage): Promise<AgentMessage> {
        if (!this.chat)
        {
            throw new Error("Researcher agent not initialized");
        }

        const prompt = ChatPromptTemplate.fromMessages([
            new SystemMessage(this.createSystemMessage()),
            new HumanMessage(message.content)
        ]);

        const response = await this.chat.invoke(await prompt.formatMessages({
            tools: this.getToolDescriptions()
        }));

        const responseText = response.content as string;
        if (responseText.includes("ACTION:"))
        {
            const actionMatch = responseText.match(/ACTION:\s*(\w+)\s*\((.*)\)/);
            if (actionMatch)
            {
                const [_, toolName, argsStr] = actionMatch;
                let args;
                try
                {
                    args = JSON.parse(argsStr);
                } catch
                {
                    args = {}; // Default empty args if parsing fails
                }

                const toolResult = await this.executeTool(toolName, args);
                return {
                    role: "assistant",
                    content: `Tool ${toolName} executed with result: ${toolResult.message}`
                };
            }
        }

        return {
            role: "assistant",
            content: responseText
        };
    }

    private createSystemMessage(): string {
        return `${this.config.systemPrompt}

You are skilled at analyzing web pages and finding the right elements to interact with.
When you execute tools, provide detailed feedback about:
- Elements found and their locations
- Suggested selectors for interaction
- Any issues or potential problems
- Recommendations for next steps

Available tools:

${this.getToolDescriptions()}

To use a tool, respond with:
ACTION: tool_name({"arg1": "value1", "arg2": "value2"})

Example:
ACTION: goto({"url": "https://example.com"})

Always be thorough in your analysis and provide clear, actionable insights.`;
    }
}

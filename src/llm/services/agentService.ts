import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createBrowserTools } from "../tools/browser/browserTools";
import { storageService } from "@/storage/services/storageService";
import { Settings } from "@/storage/types/settings";
import { LLMProviders } from "../types/providers";

class AgentService {
    private agent: Awaited<ReturnType<typeof createReactAgent>> | null = null;

    async initialize() {
        const response = await storageService.getData("settings");
        if (!response.success || !response.data)
        {
            throw new Error('Failed to load settings');
        }

        const settings = response.data as Settings;
        const openAIKey = settings.apiKeys.find(
            key => key.provider.toLowerCase() === LLMProviders.OPENAI.toLowerCase()
        )?.key;

        if (!openAIKey)
        {
            throw new Error('OpenAI API key not configured');
        }

        const model = new ChatOpenAI({
            openAIApiKey: openAIKey,
            modelName: "gpt-4",
            temperature: 0,
            streaming: true
        });

        const browserTools = createBrowserTools();
        this.agent = await createReactAgent({
            llm: model,
            tools: browserTools
        });
    }

    async processMessage(message: string) {
        if (!this.agent)
        {
            await this.initialize();
        }

        if (!this.agent)
        {
            throw new Error('Agent initialization failed');
        }

        const inputs = {
            messages: [{
                role: "user",
                content: message
            }]
        };

        const stream = await this.agent.stream(inputs, {
            streamMode: "values"
        });

        return stream;
    }
}

export const agentService = new AgentService();

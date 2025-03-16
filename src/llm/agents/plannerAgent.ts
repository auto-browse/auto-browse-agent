import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { storageService } from "@/storage/services/storageService";
import { Settings } from "@/storage/types/settings";
import { LLMProviders } from "../types/providers";

export async function createPlannerAgent() {
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
        modelName: "gpt-4o-mini",
        temperature: 0,
        streaming: true
    });

    const plannerPrompt = `You are a task planner that generates the next step based on the current state.

Given:
Task: {task}
History: (Each line shows a past step and its result)
{pastSteps}
Last Result: {lastResult}

Analyze this history and the current task to determine what should be done next.

If the task is complete (based on history and results), respond with exactly:
"Task completed: <explanation why it's complete>"

Otherwise, provide the next single step that should be taken to progress towards completing the task.
Be specific and clear about what needs to be done next.`;

    console.log(plannerPrompt);
    return await createReactAgent({
        llm: model,
        tools: [],
        stateModifier: plannerPrompt
    });
}

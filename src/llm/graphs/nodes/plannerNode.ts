import { createPlannerAgent } from "../../agents/plannerAgent";
import { BrowserGraphState } from "../types/state";

export const plannerNode = async (state: typeof BrowserGraphState.State) => {
    const agent = await createPlannerAgent();

    const pastStepsFormatted = state.pastSteps
        .map(([step, result]) => `${step} - ${result}`)
        .join('\n');

    console.log("Formatted past steps:", pastStepsFormatted);
    console.log("Current task:", state.task);
    console.log("Last result:", state.reactresult);

    const result = await agent.invoke({
        messages: [{
            role: "user",
            content: JSON.stringify({
                task: state.task,
                pastSteps: pastStepsFormatted,
                lastResult: state.reactresult
            }, null, 2)
        }]
    });
    console.log("Planner result:", result);

    // Get the planned next step from the AI's response
    const nextStep = result.messages[result.messages.length - 1].content;

    return {
        messages: result.messages,
        planString: nextStep
    };
};

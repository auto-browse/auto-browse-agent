import { createPlannerAgent } from "../../agents/plannerAgent";
import { BrowserGraphState } from "../types/state";

export const plannerNode = async (state: typeof BrowserGraphState.State) => {
    const agent = await createPlannerAgent();

    const pastStepsFormatted = state.pastSteps
        .map(([step, result]) => `Step: ${step} - Result: ${result}`)
        .join('\n');

    //console.log("Formatted past steps:", pastStepsFormatted);
    //console.log("Current task:", state.task);
    //console.log("Last result:", state.reactresult);

    const result = await agent.invoke({
        messages: [{
            role: "user",
            content: JSON.stringify({
                objective: state.task,
                completed_tasks: pastStepsFormatted,
                //lastResult: state.reactresult
            }, null, 2)
        }]
    });
    console.log("Planner result:", result);

    // Get the planned next step from the AI's response
    const plannerResponse = result.messages[result.messages.length - 1].content;

    // Handle different types of content in the response
    let responseText = '';
    if (typeof plannerResponse === 'string')
    {
        responseText = plannerResponse;
    } else if (Array.isArray(plannerResponse))
    {
        // Find text content if it's a complex message array
        const textPart = plannerResponse.find(part => part.type === 'text');
        if (textPart && 'text' in textPart)
        {
            responseText = textPart.text;
        }
    }

    // Parse the response text into an object
    const parsedResponse = JSON.parse(responseText);
    const nextStepRaw = parsedResponse.action;

    // Ensure nextStep is always a string
    const nextStep = typeof nextStepRaw === 'string'
        ? nextStepRaw
        : JSON.stringify(nextStepRaw);


    return {
        messages: result.messages,
        planString: nextStep
    };
};
import { LeadAgent } from "../agents/lead/leadAgent";
import { ResearcherAgent } from "../agents/researcher/researcherAgent";
import { CriticAgent } from "../agents/critic/criticAgent";
interface AgentResponse {
    role: "user" | "assistant";
    content: string;
}

interface SupervisorState {
    lastMessage: string;
    context: {
        url?: string;
        lastAction?: string;
        approvedActions: string[];
        warnings: string[];
    };
}

export class ChatSupervisor {
    private leadAgent: LeadAgent;
    private researcherAgent: ResearcherAgent;
    private criticAgent: CriticAgent;
    private state: SupervisorState;

    constructor() {
        this.leadAgent = new LeadAgent();
        this.researcherAgent = new ResearcherAgent();
        this.criticAgent = new CriticAgent();
        this.state = {
            lastMessage: "",
            context: {
                approvedActions: [],
                warnings: []
            }
        };
    }

    async initialize(): Promise<void> {
        await Promise.all([
            this.leadAgent.initialize(),
            this.researcherAgent.initialize(),
            this.criticAgent.initialize()
        ]);
    }

    async processMessage(message: string): Promise<string> {
        this.state.lastMessage = message;

        // 1. Lead agent processes initial request
        const leadResponse = await this.leadAgent.processMessage({
            role: "user",
            content: message
        } as AgentResponse);

        // Check if it's an action request
        if (leadResponse.content.includes("ACTION:"))
        {
            // 2. Get researcher's analysis
            const researcherResponse = await this.researcherAgent.processMessage({
                role: "user",
                content: `Analyze this proposed action: ${leadResponse.content}`
            } as AgentResponse);

            // 3. Get critic's review
            const criticResponse = await this.criticAgent.processMessage({
                role: "user",
                content: `Review this action and analysis:
Action: ${leadResponse.content}
Analysis: ${researcherResponse.content}`
            } as AgentResponse);

            // Store any warnings from the critic
            if (criticResponse.content.toLowerCase().includes("warning") ||
                criticResponse.content.toLowerCase().includes("concern"))
            {
                this.state.context.warnings.push(criticResponse.content);
            }

            // If critic approves (no major warnings), execute the action
            if (!criticResponse.content.toLowerCase().includes("do not proceed") &&
                !criticResponse.content.toLowerCase().includes("should not proceed"))
            {
                // Let lead agent execute the approved action
                const finalResponse = await this.leadAgent.processMessage({
                    role: "user",
                    content: `Execute the approved action: ${leadResponse.content}`
                } as AgentResponse);

                // Store the approved action
                this.state.context.approvedActions.push(leadResponse.content);
                return finalResponse.content;
            } else
            {
                return `Action was not approved by the critic:\n${criticResponse.content}`;
            }
        }

        // For non-action responses, return lead agent's response directly
        return leadResponse.content;
    }

    getState(): SupervisorState {
        return { ...this.state };
    }
}

import { BaseMessage, HumanMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph/web";

export const BrowserGraphState = Annotation.Root({
    messages: Annotation<[BaseMessage, { messages: BaseMessage[]; }]>({
        reducer: (x, y) => y ?? x,
        default: () => [
            new HumanMessage(""),
            { messages: [] }
        ],
    }),
    task: Annotation<string>({
        reducer: (x, y) => (y ?? x),
        default: () => "",
    }),
    planString: Annotation<string>({
        reducer: (x, y) => (y ?? x),
        default: () => "",
    }),
    steps: Annotation<string[][]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    results: Annotation<Record<string, any>>({
        reducer: (x, y) => ({ ...x, ...y }),
        default: () => ({}),
    }),
    result: Annotation<string>({
        reducer: (x, y) => (y ?? x),
        default: () => "",
    }),
    pastSteps: Annotation<[string, string][]>({
        reducer: (x, y) => x.concat(y),
    })
});

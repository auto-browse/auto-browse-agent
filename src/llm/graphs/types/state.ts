import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph/web";

export const BrowserGraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
    }),
});

import { Annotation, END, MessagesAnnotation, START, StateGraph } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { queryByDateRangeTool, filterByFieldTool } from './tools';

// ---------------------------------------------------------------------------
// State definition
// ---------------------------------------------------------------------------

const AgentState = Annotation.Root({
    ...MessagesAnnotation.spec,
    retryCount: Annotation<number>({
        reducer: (_prev, next) => next,
        default: () => 0,
    }),
    retrievedData: Annotation<string>({
        reducer: (_prev, next) => next,
        default: () => '',
    }),
});

// ---------------------------------------------------------------------------
// Tools & models
// ---------------------------------------------------------------------------

const tools = [queryByDateRangeTool, filterByFieldTool];
const toolNode = new ToolNode(tools);

const processorLlm = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0 }).bindTools(tools);

const evaluatorLlm = new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0 });

// ---------------------------------------------------------------------------
// Processor node
// ---------------------------------------------------------------------------

const PROCESSOR_SYSTEM_PROMPT =
    'You are a dental data assistant. Use the available tools to retrieve and filter dental records to answer the user\'s question. Base your answer solely on the retrieved data.';

async function processorNode(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
    const messages = [
        new SystemMessage(PROCESSOR_SYSTEM_PROMPT),
        ...state.messages,
    ];
    const response = await processorLlm.invoke(messages);
    return { messages: [response] };
}

// ---------------------------------------------------------------------------
// Evaluator node
// ---------------------------------------------------------------------------

const EVALUATOR_SYSTEM_PROMPT =
    'Review the assistant\'s response. Check: (1) No medical advice or diagnosis. (2) Response is grounded in retrieved data. (3) On-topic for dental data exploration only. Respond ONLY with JSON: {"pass": true} or {"pass": false, "reason": "..."}.';

interface EvalResult {
    pass: boolean;
    reason?: string;
}

async function evaluatorNode(state: typeof AgentState.State): Promise<Partial<typeof AgentState.State>> {
    const lastMessage = state.messages[state.messages.length - 1];
    const contentToReview =
        typeof lastMessage?.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage?.content);

    const response = await evaluatorLlm.invoke([
        new SystemMessage(EVALUATOR_SYSTEM_PROMPT),
        new HumanMessage(`Assistant response to review:\n\n${contentToReview}`),
    ]);

    const raw = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    let evalResult: EvalResult = { pass: true };
    try {
        // Strip markdown code fences if present
        const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
        evalResult = JSON.parse(cleaned) as EvalResult;
    } catch {
        // If we can't parse, default to pass to avoid blocking valid responses
        evalResult = { pass: true };
    }

    if (!evalResult.pass && state.retryCount < 2) {
        const feedbackMsg = new HumanMessage(
            `Your previous response did not pass review. Reason: ${evalResult.reason ?? 'unknown'}. Please try again.`
        );
        return {
            messages: [feedbackMsg],
            retryCount: state.retryCount + 1,
        };
    }

    if (!evalResult.pass && state.retryCount >= 2) {
        const disclaimerMsg = new AIMessage(
            'I was unable to provide a satisfactory answer based on the available dental data. Please consult a qualified dental professional for medical advice.'
        );
        return { messages: [disclaimerMsg] };
    }

    return {};
}

// ---------------------------------------------------------------------------
// Edge routing
// ---------------------------------------------------------------------------

function shouldRunTools(state: typeof AgentState.State): 'tools' | 'evaluator' {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
        return 'tools';
    }
    return 'evaluator';
}

function afterEvaluator(state: typeof AgentState.State): typeof END | 'processor' {
    const lastMessage = state.messages[state.messages.length - 1];
    // If the last message is a HumanMessage, it's feedback → loop back to processor
    if (lastMessage instanceof HumanMessage) {
        return 'processor';
    }
    return END;
}

// ---------------------------------------------------------------------------
// Graph assembly
// ---------------------------------------------------------------------------

const graph = new StateGraph(AgentState)
    .addNode('processor', processorNode)
    .addNode('tools', toolNode)
    .addNode('evaluator', evaluatorNode)
    .addEdge(START, 'processor')
    .addConditionalEdges('processor', shouldRunTools, { tools: 'tools', evaluator: 'evaluator' })
    .addEdge('tools', 'processor')
    .addConditionalEdges('evaluator', afterEvaluator, { processor: 'processor', [END]: END });

export const compiledGraph = graph.compile();

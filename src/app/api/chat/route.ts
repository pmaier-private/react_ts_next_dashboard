import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { compiledGraph } from '../../lib/agent/graph';

export async function POST(request: Request): Promise<Response> {
    try {
        const body = (await request.json()) as unknown;

        if (
            typeof body !== 'object' ||
            body === null ||
            !Array.isArray((body as Record<string, unknown>).messages)
        ) {
            return new Response(JSON.stringify({ error: 'Invalid request body: messages array required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const rawMessages = (body as { messages: { role: string; content: string }[] }).messages;

        const langchainMessages = rawMessages.map((msg) => {
            if (msg.role === 'assistant' || msg.role === 'ai') {
                return new AIMessage(msg.content);
            }
            return new HumanMessage(msg.content);
        });

        const result = await compiledGraph.invoke({
            messages: langchainMessages,
            retryCount: 0,
            retrievedData: '',
        });

        const allMessages: (HumanMessage | AIMessage)[] = result.messages as (HumanMessage | AIMessage)[];
        const lastAiMessage = [...allMessages].reverse().find((m) => m instanceof AIMessage);

        const content = lastAiMessage?.content ?? '';

        return new Response(JSON.stringify({ message: content }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal server error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

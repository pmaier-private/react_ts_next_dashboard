"use client";

import { useState, useRef, useEffect, JSX } from "react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface ChatResponse {
    message?: string;
    error?: string;
}

function isChatResponse(value: unknown): value is ChatResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        ("message" in value || "error" in value)
    );
}

/**
 * ChatWindow - Interactive client component for the Dental Data Chat.
 *
 * Renders a scrollable message list and a text input for sending messages.
 * Communicates with the /api/chat route handler and displays assistant responses.
 */
export default function ChatWindow(): JSX.Element {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage: Message = { role: "user", content: trimmed };
        const nextMessages = [...messages, userMessage];

        setMessages(nextMessages);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: nextMessages }),
            });

            const raw: unknown = await response.json();

            if (!isChatResponse(raw)) {
                throw new Error("Unexpected response shape from /api/chat");
            }

            if (!response.ok || raw.error) {
                throw new Error(raw.error ?? `Server error ${response.status}`);
            }

            const assistantMessage: Message = {
                role: "assistant",
                content: raw.message ?? "",
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err: unknown) {
            const errorText =
                err instanceof Error ? err.message : "An unknown error occurred";
            const errorMessage: Message = {
                role: "assistant",
                content: `⚠️ Error: ${errorText}`,
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex flex-col h-[600px] w-full rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900">
            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                    <p className="text-center text-sm text-zinc-400 dark:text-zinc-500 mt-8">
                        No messages yet. Ask a question to get started.
                    </p>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === "user"
                                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black"
                                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                            }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[75%] rounded-2xl px-4 py-2 text-sm bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 italic">
                            Thinking…
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-700 p-3"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    placeholder="Ask a question about dental records…"
                    className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading || input.trim() === ""}
                    className="rounded-full bg-zinc-900 dark:bg-zinc-100 px-4 py-2 text-sm font-semibold text-white dark:text-black transition hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

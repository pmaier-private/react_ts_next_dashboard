import Link from "next/link";
import ChatWindow from "./ChatWindow";

/**
 * ChatPage - Server component for the Dental Data Chat page.
 *
 * Renders a page header and the interactive ChatWindow client component.
 */
export default function ChatPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col gap-8 py-16 px-16 bg-white dark:bg-black">
                {/* Header */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                            Dental Data Chat
                        </h1>
                        <Link
                            href="/"
                            className="inline-flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                            ← Dashboard
                        </Link>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Ask questions about dental records in natural language.
                    </p>
                </div>

                {/* Chat interface */}
                <ChatWindow />
            </main>
        </div>
    );
}

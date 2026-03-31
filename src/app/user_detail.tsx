"use client";

import { useState, useEffect, JSX } from "react";
import { fetchFromJsonPlaceholder, User } from "./lib/api";

type State =
    | { status: "loading" }
    | { status: "error"; error: string }
    | { status: "success"; data: User };

/**
 * Fetch and display details for a specific user.
 * 
 * Using an effect the user is fetched from the jsonplaceholder API.
 * 
 * @param userId - The ID of the user to fetch details for.
 * @param title - Optional title to display above the user details. 
 * @returns Component html.
 */
export default function UserDetail({
    userId,
    title = "User Detail",
}: {
    userId: number;
    title?: string;
}): JSX.Element {
    const [state, setState] = useState<State>({ status: "loading" });
    const [trackedUserId, setTrackedUserId] = useState(userId);

    // Reset to loading during render when userId prop changes.
    // This is the React-recommended pattern for adjusting state on prop changes
    // without using a synchronous setState inside an effect.
    // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
    if (trackedUserId !== userId) {
        setTrackedUserId(userId);
        setState({ status: "loading" });
    }

    useEffect(() => {
        let isActive = true;

        fetchFromJsonPlaceholder<User>(`users/${userId}`)
            .then((data) => {
                if (isActive) {
                    setState({ status: "success", data });
                }
            })
            .catch((err) =>
                setState({
                    status: "error",
                    error:
                        err instanceof Error
                            ? err.message
                            : "An unknown error occurred",
                }),
            );

        return () => {
            isActive = false;
        };
    }, [userId]);

    if (state.status === "loading") return <p>Loading...</p>;
    if (state.status === "error") return <p>Error: {state.error}</p>;

    const user = state.data;

    return (
        <div className="rounded-xl border border-zinc-200 p-5">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone}</p>
        </div>
    );
}

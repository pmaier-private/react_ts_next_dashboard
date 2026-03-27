"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchFromJsonPlaceholder, User } from "./api";
import React from "react";
import Link from "next/link";

interface UsersComponentProps {
    endpoint?: string;
    selectedUserId?: number;
    onUserSelect?: (userId: number) => void;
}

type State =
    | { status: "loading" }
    | { status: "error"; error: string }
    | { status: "success"; data: User[] };

export default function UsersComponent({
    endpoint = "users",
    selectedUserId,
    onUserSelect,
}: UsersComponentProps) {
    const [state, setState] = useState<State>({ status: "loading" });

    // const fetchUsers = useCallback(async () => {
    //     try {
    //         const data = await fetchFromJsonPlaceHolder<User[]>(endpoint);
    //         setState({ status: 'success', data });
    //     } catch (err) {
    //         setState({
    //             status: 'error',
    //             error: err instanceof Error ? err.message : 'An unknown error occurred'
    //         });
    //     }
    // }, [endpoint]);

    // useEffect(fetchUsers, [fetchUsers]);

    useEffect(() => {
        fetchFromJsonPlaceholder<User[]>(endpoint)
            .then((data) => setState({ status: "success", data }))
            .catch((err) =>
                setState({
                    status: "error",
                    error:
                        err instanceof Error
                            ? err.message
                            : "An unknown error occurred",
                }),
            );
    }, [endpoint]);

    if (state.status === "loading") return <p>Loading...</p>;
    if (state.status === "error") return <p>Error: {state.error}</p>;

    const users = state.data;

    // First, build the HTML user list by mapping the users to list items, then
    // return the list wrapped in `<ul>`. The list is additionally memoized to
    // avoid unnecessary re-renders when the selected user changes.
    const userList = useMemo(() => {
        // Map each user in 'users' to a list element with a link parameterized
        // with the user's id.
        return users.map((user) => (
            <li key={user.id}>
                <Link
                    href={`?userId=${user.id}`}
                    className={`block w-full px-4 py-1 rounded ${
                        selectedUserId === user.id
                            ? "border bg-black/[.04]"
                            : "hover:bg-black/[.04]"
                    }`}
                >
                    <span className="font-medium">{user.name}</span>
                </Link>
            </li>
        ));
    }, [selectedUserId, users]);

    return (
        <div className="w-full space-y-4">
            <h1>Users from JSONPlaceholder</h1>
            <ul className="space-y-3">{userList}</ul>
            <br></br>
            <UpdateUserForm userId={3} />
        </div>
    );
}

// Form state using Partial - user can update any field, not all
type UserFormState = Partial<User>;

function UpdateUserFormFn({ userId }: { userId: number }) {
    const [formData, setFormData] = useState<UserFormState>({});

    const handleChange = (field: keyof User, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        // Only send changed fields to the API
        await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
            method: "PATCH",
            body: JSON.stringify(formData),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                placeholder="Name"
                onChange={(e) => handleChange("name", e.target.value)}
            />
            <input
                placeholder="Email"
                onChange={(e) => handleChange("email", e.target.value)}
            />
            <button
                type="submit"
                className="hover:bg-black/[.04] px-4 py-2 rounded-full transition-colors"
            >
                Update
            </button>
        </form>
    );
}

export const UpdateUserForm = React.memo(UpdateUserFormFn);

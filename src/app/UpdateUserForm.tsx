"use client";

import { useState } from "react";
import { User } from "./api";

// Form state using Partial so users can update only selected fields.
type UserFormState = Partial<User>;

interface UpdateUserFormProps {
    userId: number;
}

export default function UpdateUserForm({ userId }: UpdateUserFormProps) {
    const [formData, setFormData] = useState<UserFormState>({});

    const handleChange = (field: keyof User, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
            method: "PATCH",
            body: JSON.stringify(formData),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-x-2">
            <input
                placeholder="Name"
                onChange={(e) => handleChange("name", e.target.value)}
                className="rounded border px-3 py-1"
            />
            <input
                placeholder="Email"
                onChange={(e) => handleChange("email", e.target.value)}
                className="rounded border px-3 py-1"
            />
            <button
                type="submit"
                className="rounded-full px-4 py-2 transition-colors hover:bg-black/[.04]"
            >
                Update
            </button>
        </form>
    );
}

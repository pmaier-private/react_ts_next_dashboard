'use client';

import { useEffect, useState } from 'react';
import { fetchData, User } from './api';

type State =
    | { status: 'loading' }
    | { status: 'error'; error: string }
    | { status: 'success'; data: User[] };

export default function UsersComponent() {
    const [state, setState] = useState<State>({ status: 'loading' });

    useEffect(() => {
        fetchData<User[]>("users")
            .then(data => setState({ status: 'success', data }))
            .catch(err => setState({ 
                status: 'error', 
                error: err instanceof Error ? err.message : 'An unknown error occurred' 
            }))
    }, []);

    if (state.status === 'loading') return <p>Loading...</p>;
    if (state.status === 'error') return <p>Error: {state.error}</p>;

    const users = state.data;

    return (
        <div>
            <h1>Users from JSONPlaceholder</h1>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.name} ({user.email}) -- {user.phone}</li>
                ))}
            </ul>
        </div>
    );
}

// Form state using Partial - user can update any field, not all
type UserFormState = Partial<User>;

export function UpdateUserForm({ userId }: { userId: number }) {
    const [formData, setFormData] = useState<UserFormState>({});
    
    const handleChange = (field: keyof User, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        // Only send changed fields to the API
        await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(formData)
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
                placeholder="Name" 
                onChange={e => handleChange('name', e.target.value)}
            />
            <input 
                placeholder="Email" 
                onChange={e => handleChange('email', e.target.value)}
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
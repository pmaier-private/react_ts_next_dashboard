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
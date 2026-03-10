'use client';

import { useEffect, useState } from 'react';
import { fetchData, User } from './api';

export default function UsersComponent() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData<User[]>("users")
            .then(data => setUsers(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

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
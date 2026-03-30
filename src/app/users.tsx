import { fetchFromJsonPlaceholder, User } from "./lib/api";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import UpdateUserForm from "./UpdateUserForm";

interface UsersComponentProps {
    endpoint?: string;
    selectedUserId?: number;
}

/**
 * Retrieve the users from JSONPlaceholder and cache the result.
 * 
 * This function uses Next.js's unstable_cache to store the fetched users
 * across requests for 5 minutes (300 seconds).
 * 
 * Note that "unstable" means the API is subject to change, but the cache is
 * production ready.
 * 
 * @returns The user list from JSONPlaceholder.
 */
const getUsers = unstable_cache(
    async (): Promise<User[]> => {
        return fetchFromJsonPlaceholder<User[]>("users");
    },
    ["jsonplaceholder-users"],
    { revalidate: 300 },
);

export default async function UsersComponent({
    selectedUserId,
}: UsersComponentProps) {
    let users: User[];

    try {
        users = await getUsers();
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "An unknown error occurred";
        return <p>Error: {errorMessage}</p>;
    }

    return (
        <div className="w-full space-y-4">
            <h1>Users from JSONPlaceholder</h1>
            <ul className="space-y-3">
                {users.map((user) => (
                    <li key={user.id}>
                        <Link
                            href={`?userId=${user.id}`}
                            className={`block w-full rounded px-4 py-1 ${
                                selectedUserId === user.id
                                    ? "border bg-black/[.04]"
                                    : "hover:bg-black/[.04]"
                            }`}
                        >
                            <span className="font-medium">{user.name}</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <br />
            <UpdateUserForm userId={3} />
        </div>
    );
}

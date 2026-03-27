// Definiere ein Interface für User aus JSONPlaceholder mit id, name, email und phone
export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
}

// Definiere ein Interface für Post aus JSONPlaceholder mit id, userId, title und body
export interface BlogPost {
    id: number;
    userId: number;
    title: string;
    body: string;
    rating?: 1 | 2 | 3 | 4 | 5;
}

// definiere ein Interface für ein Todo Item aus JSONPlaceholder mit id, userId, title und completed
export interface TodoItem {
    id: number;
    userId: number;
    title: string;
    completed: boolean;
}

function hasStringProperty(
    obj: Record<string, unknown>,
    key: string
): boolean {
    return typeof obj[key] === 'string';
}

// schreibe eine generische Fetch-Funktion für die API-Calls for User, Blogpost und TodoItem
export async function fetchFromJsonPlaceholder<T>(endpoint: string): Promise<T> {
    // wait for 2 seconds to simulate a slow network
    await new Promise(resolve => setTimeout(resolve, 2000));
    const response = await fetch(`https://jsonplaceholder.typicode.com/${endpoint}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint}: ${response.statusText}`);
    }
    return response.json();
}

export function isValidUser(obj: unknown): obj is User {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    const candidate = obj as Record<string, unknown>;

    return (
        typeof candidate.id === 'number' &&
        hasStringProperty(candidate, 'name') &&
        hasStringProperty(candidate, 'email') &&
        hasStringProperty(candidate, 'phone')
    );
}

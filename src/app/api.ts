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

// schreibe eine generische Fetch-Funktion für die API-Calls for User, Blogpost und TodoItem
export async function fetchData<T>(endpoint: string): Promise<T> {
    // wait for 2 seconds to simulate a slow network
    // Note that there 
    await new Promise(resolve => setTimeout(resolve, 2000));
    const response = await fetch(`https://jsonplaceholder.typicode.com/${endpoint}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${endpoint}: ${response.statusText}`);
    }
    return response.json();
}


// // User endpoint
// await fetchData<User[]>('users');              // Get all users
// await fetchData<User>('users/1');              // Get user with ID 1

// // BlogPost endpoint
// await fetchData<BlogPost[]>('posts');          // Get all posts
// await fetchData<BlogPost>('posts/1');          // Get post with ID 1
// await fetchData<BlogPost[]>('users/1/posts');  // Get all posts by user 1

// // TodoItem endpoint
// await fetchData<TodoItem[]>('todos');          // Get all todos
// await fetchData<TodoItem>('todos/1');          // Get todo with ID 1
// await fetchData<TodoItem[]>('users/1/todos');  // Get all todos by user 1

// fetchData<User[]>("users").then(users => console.log(users));

const post: BlogPost = await fetchData<BlogPost>("posts/2");

console.log(post);

const user: User = post as unknown as User;

// Better: use unknown instead of any
function isValidUser(obj: unknown): obj is User {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'id' in obj && typeof (obj as any).id === 'number' &&
        'name' in obj && typeof (obj as any).name === 'string' &&
        'email' in obj && typeof (obj as any).email === 'string' &&
        'phone' in obj && typeof (obj as any).phone === 'string'
    );
}
// unaware of typing problem
console.log(user);

// need a runtime type guard to check if the user is actually a User
// useful for defensive retrieval of data from APIs that we do not know that well
// if (isValidUser(user)) {
//     console.log(user);
// } else {
//     console.error("The fetched post cannot be cast to a User.");
// }

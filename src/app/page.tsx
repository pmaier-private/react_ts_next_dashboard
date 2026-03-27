import UsersComponent from "./users";
import UserDetail from "./user_detail";


interface HomeProps {
    searchParams: Promise<{
        userId?: string;
    }>;
};

/**
 * Home - Main page component for the dashboard.
 *
 * Renders the home page with a list of users and user detail sections. Accepts
 * an optional userId query parameter to display details for a selected user.
 *
 * @param {HomeProps} props - Component props
 * @param {Promise<{userId?: string}>} props.searchParams - URL search
 * parameters containing optional userId
 * @returns {Promise<JSX.Element>} The rendered home page component
 */
export default async function Home({searchParams}: HomeProps) {
    // const [selectedUserId, setSelectedUserId] = useState(2);

    const {userId} = await searchParams;
    const selectedUserId = userId ? parseInt(userId) : undefined;

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
                <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
                    <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                        Paul Maier -- Learning React Dashboard
                    </h1>
                </div>
                <UsersComponent
                    selectedUserId={selectedUserId}
                />
                <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
                    <UserDetail userId={1} title="Pinned User" />
                    {selectedUserId ? (
                        <UserDetail userId={selectedUserId} title="Selected User" />
                    ) : (
                        <div className="rounded-xl border border-zinc-200 p-5">
                            <h2 className="mb-4 text-lg font-semibold">Selected User</h2>
                            <p>Select a user from the list.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

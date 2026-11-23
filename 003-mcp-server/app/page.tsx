import prisma from "../lib/prisma";

export default async function Home() {
    let users: Array<{
        id: number;
        email: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
    }> = [];
    let posts: Array<{
        id: number;
        title: string;
        content: string | null;
        published: boolean;
        createdAt: Date;
        author: {
            id: number;
            name: string | null;
            email: string;
        };
    }> = [];
    let error = null;

    try {
        [users, posts] = await Promise.all([
            prisma.user.findMany({
                orderBy: {
                    createdAt: "desc",
                },
            }),
            prisma.post.findMany({
                orderBy: {
                    createdAt: "desc",
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
        ]);
    } catch (e) {
        console.error("Error fetching data:", e);
        error =
            "Failed to load data. Make sure your DATABASE_URL is configured.";
    }

    return (
        <main className="p-8 space-y-12">
            <section>
                <h1 className="text-2xl font-bold mb-4">Users from Database</h1>
                {error ? (
                    <p className="text-red-500">{error}</p>
                ) : users.length === 0 ? (
                    <p>No users yet. Create one using the API at /api/users</p>
                ) : (
                    <ul className="space-y-2">
                        {users.map((user) => (
                            <li key={user.id} className="border p-4 rounded">
                                <p className="font-semibold">
                                    {user.name || "No name"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {user.email}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4">Posts</h2>
                {error ? null : posts.length === 0 ? (
                    <p>No posts yet.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="border rounded-lg p-4 flex flex-col gap-2 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-semibold text-lg">
                                        {post.title}
                                    </h3>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                                            post.published
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                        }`}
                                    >
                                        {post.published ? "Published" : "Draft"}
                                    </span>
                                </div>
                                {post.content && (
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {post.content}
                                    </p>
                                )}
                                <div className="mt-auto pt-2 text-xs text-gray-500 border-t">
                                    By {post.author.name || post.author.email}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

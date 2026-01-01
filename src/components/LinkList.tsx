import React, { useEffect, useState } from "react";

interface ApiLink {
    description: string;
    type: string;
    link: string;
    timestamp: string;
}

interface GroupedLinks {
    category: string;
    items: ApiLink[];
}

const API_URL =
    "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgARRBZz3RXfAPImS72w0F4jtOxIF4VegxMr9wL4-yZntOkroJAhlzw2uJLGhlTMPb3N4_SwvS3jkZpGDK4IiKcAZskakgzzPB1Em-i59-ceVqdR9uNce2e5D7Cddx64tYwl6KTQ5BHhA9lnvBMRARXoumAynp5BjoTFpyirwB184OweZ9L2FSiel_6XVzanGUmqObmvIJUu6nv6MRgyPaPzewM6Dwa-JG52eCvgQw7DyvDZNIsioMZtxjGSf-zmtDKui9NgYQ4wJCOSXvIWvz9vn9VzQ&lib=MN-ADcV0xlYzRfC8ALnp5oR_1caAnuAfe";

const LinkList = () => {
    const [groupedLinks, setGroupedLinks] = useState<GroupedLinks[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error("Failed to fetch links");
                }
                const { data }: { data: ApiLink[] } = await response.json();

                const grouped = Object.values(
                    data.reduce(
                        (acc, item) => {
                            const { type } = item;
                            if (!acc[type]) {
                                acc[type] = { category: type, items: [] };
                            }
                            acc[type].items.push(item);
                            return acc;
                        },
                        {} as Record<string, GroupedLinks>
                    )
                ).sort((a, b) => {
                    if (a.category.toLowerCase() === "miscellaneous") return 1;
                    if (b.category.toLowerCase() === "miscellaneous") return -1;
                    return a.category.localeCompare(b.category);
                });

                setGroupedLinks(grouped);
            } catch (err) {
                setError("Unable to load links at this time.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLinks();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <div className="text-skin-base animate-pulse">Loading links...</div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 py-4">{error}</div>;
    }

    return (
        <div>
            {groupedLinks.map((category) => (
                <div key={category.category} className="mb-10">
                    <h2 className="text-xl font-semibold sm:text-2xl mb-4 text-skin-accent">
                        {category.category}
                    </h2>
                    <ul className="pl-0">
                        {category.items.map((item, index) => (
                            <li
                                key={index}
                                className="mb-4 flex list-none flex-col sm:flex-row sm:items-start sm:gap-4"
                            >
                                <div className="flex-1">
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block font-medium text-skin-base hover:text-skin-accent hover:underline sm:inline"
                                    >
                                        {item.description}
                                    </a>
                                </div>
                                {item.timestamp && (
                                    <div className="mt-1 whitespace-nowrap text-sm text-skin-base opacity-70 sm:mt-0">
                                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default LinkList;

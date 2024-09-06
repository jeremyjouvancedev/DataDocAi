"use client"; // Add this directive at the top
import {useState, useEffect, ChangeEvent} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";

interface Page {
    id: number;
    name: string;
}

const CatalogsPage: React.FC = () => {
    const [catalogs, setCatalogs] = useState<Page[]>([]);

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);


    const fetchCatalogs = () => {
        fetch("http://localhost:8000/metadata/catalogs")
            .then(response => response.json())
            .then((data: Page[]) => setCatalogs(data));
    };

    useEffect(() => {
        // Fetch catalogs from an API or backend
        fetchCatalogs()
    }, []);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const syncCatalogs = () => {
        setLoading(true)
        // Send selected catalogs to the backend for document generation
        fetch("http://localhost:8000/metadata/synchronize/catalogs/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            setLoading(false)
            if (response.ok) {
                fetchCatalogs()
            }
        });
    }

    const filteredCatalogs = searchTerm
        ? catalogs.filter((catalog) =>
            catalog.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : catalogs;

    return (
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-start gap-8 p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">Catalog Management</h1>

            <div className="w-full lg:max-w-2xl space-y-6">

                {/* Search Input */}
                <div className="flex w-full justify-center">
                    <Input
                        type="text"
                        placeholder="Search catalogs..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                {/* Actions Section */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="w-full flex justify-center">
                                <div
                                    className="w-6 h-6 border-4 border-indigo-400 border-dotted rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <Button
                                onClick={syncCatalogs}
                                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                            >
                                Sync Catalogs
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                            <thead
                                className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">
                                    Catalog name
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredCatalogs.map((catalog) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {catalog.name}
                                    </th>
                                    <td className="px-6 py-4">
                                        <a href={"catalogs/catalog/" + catalog.id}
                                           className="inline-flex items-center justify-center p-5 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white">
                                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                 fill="currentColor" viewBox="0 0 24 24">
                                                <path fill-rule="evenodd"
                                                      d="M4.998 7.78C6.729 6.345 9.198 5 12 5c2.802 0 5.27 1.345 7.002 2.78a12.713 12.713 0 0 1 2.096 2.183c.253.344.465.682.618.997.14.286.284.658.284 1.04s-.145.754-.284 1.04a6.6 6.6 0 0 1-.618.997 12.712 12.712 0 0 1-2.096 2.183C17.271 17.655 14.802 19 12 19c-2.802 0-5.27-1.345-7.002-2.78a12.712 12.712 0 0 1-2.096-2.183 6.6 6.6 0 0 1-.618-.997C2.144 12.754 2 12.382 2 12s.145-.754.284-1.04c.153-.315.365-.653.618-.997A12.714 12.714 0 0 1 4.998 7.78ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                                                      clip-rule="evenodd"/>
                                            </svg>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default CatalogsPage;
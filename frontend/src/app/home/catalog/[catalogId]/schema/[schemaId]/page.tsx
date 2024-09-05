"use client"; // Add this directive at the top
import {useState, useEffect, ChangeEvent} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {NextPage} from "next";

interface Page {
    id: number;
    name: string;
}

interface PageProps {
    params: {
        catalogId: string;
        schemaId: string;
    };
}


const TablesPage: NextPage<PageProps> = ({params}) => {
    const {catalogId, schemaId} = params;

    const [catalog, setCatalog] = useState();
    const [schema, setSchema] = useState();
    const [tables, setTables] = useState([]);

    const [searchTerm, setSearchTerm] = useState<string>("");

    const fetchCatalog = () => {
        // Send selected catalogs to the backend for document generation
        fetch(`http://localhost:8000/metadata/catalogs/${catalogId}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if (response.ok) {
                return response.json()
            }
        }).then((data) => {
            setCatalog(data)
        });
    }

    const fetchSchema = () => {
        // Send selected catalogs to the backend for document generation
        fetch(`http://localhost:8000/metadata/schemas/${schemaId}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if (response.ok) {
                return response.json()
            }
        }).then((data) => {
            setSchema(data)
        });
    }


    const fetchTables = () => {
        // Send selected catalogs to the backend for document generation
        fetch(`http://localhost:8000/metadata/schemas/${schemaId}/tables/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if (response.ok) {
                return response.json()
            }
        }).then((data) => {
            if (data.data)
                setTables(data.data)
        });
    }

    useEffect(() => {
        fetchCatalog()
        fetchSchema()
        fetchTables()
    }, []);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const syncTables = () => {
        // Send selected catalogs to the backend for document generation
        fetch("http://localhost:8000/metadata/synchronize/tables/", {
            method: "POST",
            body: JSON.stringify({
                schema_id: schemaId
            }),
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            if (response.ok) {
                fetchTables()
            }
        });
    }

    const filteredCatalogs = searchTerm
        ? tables.filter((table) =>
            table.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : tables;

    return (
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-start gap-8 p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">Table Management {catalog?.name} > {schema?.name}</h1>

            <div className="w-full lg:max-w-2xl space-y-6">
                {/* Search Input */}
                <div className="flex w-full justify-center">
                    <Input
                        type="text"
                        placeholder="Search tables..."
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
                        <Button
                            onClick={syncTables}
                            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Sync Tables
                        </Button>
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
                            {tables.map((table) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {table.name}
                                    </th>
                                    <td className="px-6 py-4">
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

export default TablesPage;
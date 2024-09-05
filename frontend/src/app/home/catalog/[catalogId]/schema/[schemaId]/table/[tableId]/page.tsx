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
        tableId: string;
    };
}


const TablesPage: NextPage<PageProps> = ({params}) => {
    const {catalogId, schemaId, tableId} = params;

    const [catalog, setCatalog] = useState();
    const [schema, setSchema] = useState();
    const [table, setTable] = useState();
    const [columns, setColumns] = useState([]);

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


    const fetchTable = () => {
        // Send selected catalogs to the backend for document generation
        fetch(`http://localhost:8000/metadata/tables/${tableId}/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }).then((response) => {
            if (response.ok) {
                return response.json()
            }
        }).then((data) => {
            setTable(data)
        });
    }

    const fetchColumns = () => {
        // Send selected catalogs to the backend for document generation
        fetch(`http://localhost:8000/metadata/tables/${tableId}/columns/`, {
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
                setColumns(data.data)
        });
    }

    useEffect(() => {
        fetchCatalog()
        fetchSchema()
        fetchTable()
        fetchColumns()
    }, []);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const syncColumns = () => {
        // Send selected catalogs to the backend for document generation
        fetch("http://localhost:8000/metadata/synchronize/columns/", {
            method: "POST",
            body: JSON.stringify({
                table_id: tableId
            }),
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            if (response.ok) {
                fetchColumns()
            }
        });
    }

    const generateDocumentation = () => {
        // Send selected catalogs to the backend for document generation
        fetch(`http://localhost:8000/metadata/tables/${tableId}/generate-documentation/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            if (response.ok) {
                fetchColumns()
            }
        });
    }

    const filteredCatalogs = searchTerm
        ? columns.filter((column) =>
            column.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : columns;

    return (
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-start gap-8 p-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">Table
                Management {catalog?.name} > {schema?.name} > {table?.name}</h1>

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
                            onClick={generateDocumentation}
                            className="w-full bg-lime-500 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Generate Documentation
                        </Button>
                        <Button
                            onClick={syncColumns}
                            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Sync Columns
                        </Button>

                    </CardContent>
                </Card>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Description</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>{table?.documentation}</p>
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
                                    Description
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {columns.map((column) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {column.name}
                                    </th>
                                    <td className="px-6 py-4">
                                        {column.documentation}
                                    </td>
                                    <td className="px-6 py-4">
                                        <a className="inline-flex items-center justify-center p-5 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white">
                                            <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                                 xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                                 viewBox="0 0 24 24">
                                                <path stroke="currentColor" stroke-linecap="round"
                                                      stroke-linejoin="round" stroke-width="2"
                                                      d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"/>
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

export default TablesPage;
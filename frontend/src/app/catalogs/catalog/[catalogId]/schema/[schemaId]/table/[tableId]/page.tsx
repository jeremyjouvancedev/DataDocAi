"use client"; // Add this directive at the top
import {useState, useEffect, ChangeEvent, FormEvent} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {NextPage} from "next";
import {Modal, ModalHeader, ModalBody, ModalFooter} from 'flowbite-react';

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
    const [loading, setLoading] = useState<boolean>(false);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
    const [newDescription, setNewDescription] = useState<string>("");

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
        setLoading(true)
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
            setLoading(false)
            if (response.ok) {
                fetchColumns()
            }
        });
    }

    const generateDocumentation = () => {
        setLoading(true)

        // Send selected catalogs to the backend for document generation
        fetch(`http://localhost:8000/metadata/tables/${tableId}/generate-documentation/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            setLoading(false)

            if (response.ok) {
                fetchTable()
                fetchColumns()
            }
        });
    }

    const filteredColumns = searchTerm
        ? columns.filter((column) =>
            column.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : columns;

    const handleEditClick = (column: Column) => {
        setSelectedColumn(column);
        setNewDescription(column.documentation);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedColumn(null);
        setNewDescription("");
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewDescription(e.target.value);
    };

    const handleSaveDescription = (e: FormEvent) => {
        e.preventDefault();

        if (selectedColumn) {
            fetch(`http://localhost:8000/metadata/columns/${selectedColumn.id}/`, {
                method: "PUT",
                body: JSON.stringify({
                    name: selectedColumn.name,
                    documentation: newDescription,
                    table: selectedColumn.table
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            }).then((response) => {
                if (response.ok) {
                    fetchColumns();
                    handleModalClose();
                }
            });
        }
    };

    return (
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-start gap-8 p-6">
            <nav
                className="flex px-5 py-3 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                    <li className="inline-flex items-center">
                        <a href="/catalogs"
                           className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                            <svg className="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                 fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                            </svg>
                            Catalogs
                        </a>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <svg className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400 " aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" strokeLinejoin="round"
                                      stroke-width="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            <a href={`/catalogs/catalog/${catalog?.id}`}
                               className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">
                                {catalog?.name}
                            </a>
                        </div>
                    </li>

                    <li>
                        <div className="flex items-center">
                            <svg className="rtl:rotate-180 block w-3 h-3 mx-1 text-gray-400 " aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            <a href={`/catalogs/catalog/${catalog?.id}/schema/${schema?.id}`}
                               className="ms-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ms-2 dark:text-gray-400 dark:hover:text-white">
                                {schema?.name}
                            </a>
                        </div>
                    </li>
                    <li aria-current="page">
                        <div className="flex items-center">
                            <svg className="rtl:rotate-180  w-3 h-3 mx-1 text-gray-400" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            <span
                                className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">{table?.name}</span>
                        </div>
                    </li>
                </ol>
            </nav>

            <h1 className="text-3xl font-bold text-center text-gray-800">Table
                Management {table?.name}</h1>

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

                        {loading ? (
                            <div className="w-full flex justify-center">
                                <div
                                    className="w-6 h-6 border-4 border-indigo-400 border-dotted rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <>
                                <Button
                                    onClick={generateDocumentation}
                                    className="w-full bg-lime-500 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                                >
                                    Generate Documentation
                                </Button>
                                <Button
                                    onClick={syncColumns}
                                    className="w-full bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50">
                                    Sync Columns
                                </Button>
                            </>
                        )}
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
                                    Column name
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
                            {filteredColumns.map((column) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {column.name}
                                    </th>
                                    <td className="px-6 py-4">
                                        {column.documentation}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button
                                            onClick={() => handleEditClick(column)}
                                            className="bg-blue-500 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>


            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                        <h2 className="text-lg font-semibold">Edit Description</h2>
                        <form onSubmit={handleSaveDescription}>
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    value={newDescription}
                                    onChange={handleDescriptionChange}
                                    className="w-full px-4 py-2 border rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <div className="flex justify-end space-x-4">
                                    <Button
                                        type="button"
                                        onClick={handleModalClose}
                                        className="bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 focus:ring-opacity-50">
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-blue-500 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50">
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
        ;
};

export default TablesPage;
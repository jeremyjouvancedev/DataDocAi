'use client';
import {NextPage} from 'next';
import {use} from 'next/navigation';
import {ChangeEvent, useEffect, useState} from "react";
import {hasOwnProperty} from "tailwindcss";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input"; // for client-side navigation

interface PageProps {
    params: {
        catalogId: string;
    };
}

interface Schema {

    name: string;
}

interface Catalog {
    name: string;
    schemas: Schema[];
}

const CatalogPage: NextPage<PageProps> = ({params}) => {
    const {catalogId} = params;
    const [catalog, setCatalog] = useState()
    const [schemas, setSchemas] = useState<Schema[]>([])

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchSchemas = () => {
        // Send selected catalogs to the backend for document generation
        fetch(`http://localhost:8000/metadata/catalogs/${catalogId}/schemas/`, {
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
                setSchemas(data.data)
        });
    }

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

    useEffect(() => {
        fetchCatalog()
        fetchSchemas()
    }, []);

    const handleSyncSchemas = () => {
        // Send selected catalogs to the backend for document generation
        fetch("http://localhost:8000/metadata/synchronize/schemas/", {
            method: "POST",
            body: JSON.stringify({catalog_id: catalogId}),
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            if (response.ok) {
                fetchSchemas()
            }
        });
    };

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredSchemas = searchTerm
        ? schemas.filter((schema) =>
            schema.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : schemas;


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
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                      stroke-width="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            <span className="ms-1 text-sm font-medium text-gray-500 md:ms-2 dark:text-gray-400">
                                {catalog?.name}
                            </span>
                        </div>
                    </li>
                </ol>
            </nav>

            <h1 className="text-3xl font-bold text-center text-gray-800">Schemas Management: {catalog?.name}</h1>

            <div className="w-full lg:max-w-2xl space-y-6">
                <div className="flex w-full justify-center">
                    <Input
                        type="text"
                        placeholder="Search Schemas..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 border rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>


                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleSyncSchemas}
                            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Sync Schemas
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
                                    Schema name
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Action
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredSchemas.map((schema) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <th scope="row"
                                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {schema.name}
                                    </th>
                                    <td className="px-6 py-4">
                                        <a href={catalogId + "/schema/" + schema.id}
                                           className="inline-flex items-center justify-center p-5 text-base font-medium text-gray-500 rounded-lg bg-gray-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white">
                                            <svg className="w-6 h-6 text-gray-800 dark:text-white"
                                                 aria-hidden="true"
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

export default CatalogPage;

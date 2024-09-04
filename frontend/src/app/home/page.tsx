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
    const [selectedCatalogs, setSelectedCatalogs] = useState<Page[]>([]);

    useEffect(() => {
        // Fetch catalogs from an API or backend
        fetch("http://localhost:8000/metadata/catalogs")
            .then(response => response.json())
            .then((data: Page[]) => setCatalogs(data));
    }, []);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSelectCatalog = (catalog: Page) => {
        setSelectedCatalogs((prevSelected) =>
            prevSelected.includes(catalog)
                ? prevSelected.filter((item) => item.id !== catalog.id)
                : [...prevSelected, catalog]
        );
    };

    const handleGenerateDocs = () => {
        // Send selected catalogs to the backend for document generation
        fetch("/api/generate-docs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedCatalogs),
        }).then((response) => {
            if (response.ok) {
                // Handle successful document generation
                alert("Documentation generated successfully!");
            }
        });
    };

    const syncCatalogs = () => {
        // Send selected catalogs to the backend for document generation
        fetch("http://localhost:8000/metadata/synchronize/catalogs/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            if (response.ok) {
                // Handle successful document generation
                alert("Synchronisation Start!");
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

                {/* Catalogs List */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Available Catalogs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {filteredCatalogs.map((catalog) => (
                                <li key={catalog.id} className="flex items-center justify-between">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedCatalogs.includes(catalog)}
                                            onChange={() => handleSelectCatalog(catalog)}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-gray-800">{catalog.name}</span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Actions Section */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-700">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            disabled={selectedCatalogs.length === 0}
                            onClick={handleGenerateDocs}
                            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            Generate Documentation
                        </Button>
                        <Button
                            onClick={syncCatalogs}
                            className="w-full bg-gray-600 text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
                        >
                            Sync Catalogs
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CatalogsPage;
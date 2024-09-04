"use client"; // Add this directive at the top
import {useState, useEffect, ChangeEvent} from "react";

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
        fetch("/api/catalogs")
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

    const filteredCatalogs = searchTerm
        ? catalogs.filter((catalog) =>
            catalog.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : catalogs;

    return (
        <div>
            <h1>Catalogs</h1>
            <input
                type="text"
                placeholder="Search catalogs..."
                value={searchTerm}
                onChange={handleSearchChange}
            />
            <ul>
                {filteredCatalogs.map((catalog) => (
                    <li key={catalog.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedCatalogs.includes(catalog)}
                                onChange={() => handleSelectCatalog(catalog)}
                            />
                            {catalog.name}
                        </label>
                    </li>
                ))}
            </ul>
            <button onClick={handleGenerateDocs} disabled={selectedCatalogs.length === 0}>
                Generate Documentation
            </button>
        </div>
    );
};

export default CatalogsPage;
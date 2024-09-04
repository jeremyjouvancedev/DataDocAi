import {useState, useEffect} from "react";
import {Card, CardHeader, CardContent, CardTitle} from "@/components/ui/card";
import {AppProps} from "next/app";
import "@/styles/globals.css"; // Import global styles if needed

function MyApp({Component, pageProps}: AppProps) {
    const [tasks, setTasks] = useState<string[]>([]);

    useEffect(() => {
        // Fetch tasks from API or backend
        fetch("http://localhost:8000/api/tasks/pending")
            .then((response) => response.json())
            .then((data) => setTasks(data)); // Assuming the API returns an array of tasks
    }, []);

    return (
        <div className="flex">
            {/* Main content area */}
            <div className="flex-grow p-4">
                <Component {...pageProps} />
            </div>

            {/* Right side panel */}
            <div
                className="w-80 bg-gray-50 border-l border-gray-200 shadow-lg p-4 fixed top-0 right-0 h-full overflow-y-auto">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Pending Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {tasks.length === 0 ? (
                            <p className="text-gray-500">No pending tasks</p>
                        ) : (
                            <ul className="space-y-2">
                                {tasks.map((task, index) => (
                                    <li key={index} className="text-gray-800">
                                        - {task}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default MyApp;
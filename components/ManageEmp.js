import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function ManageEmp() {
    const [employees, setEmployees] = useState([]);
    
    const fetchEmployees = async () => {
        try {
            const response = await fetch("/api/fetch");
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleClock = async (id, type) => {
        try {
            const response = await fetch(`/api/fetch?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [type]: true }),
            });
            if (!response.ok) throw new Error("Failed to update time");
            await fetchEmployees();
        } catch (error) {
            console.error("Error updating time:", error);
        }
    };

    const toggleBreakStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === "active" ? "inactive" : "active";
            const response = await fetch(`/api/fetch?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error("Failed to update break status");
            await fetchEmployees();
        } catch (error) {
            console.error("Error updating break status:", error);
        }
    };

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold my-4">Manage Employees</h1>
            {employees.length > 0 ? (
                <div className="space-y-4">
                    {employees.map((emp) => (
                        <div key={emp.id} className="flex flex-col sm:flex-row items-center justify-between bg-white shadow-md p-4 rounded-lg border border-gray-200 overflow-hidden">
                            <div className="flex items-center space-x-4">
                                <img src={emp.avatar} alt={emp.first_name} className="w-16 h-16 rounded-full" />
                                <div>
                                    <div className="font-bold text-lg">{emp.first_name} {emp.last_name}</div>
                                    <div className="text-gray-500">{emp.role} - {emp.department}</div>
                                    <div className="text-gray-600 text-sm">{emp.email}</div>
                                </div>
                            </div>
                            <div className="text-center text-sm text-gray-700">
                                <p><strong>Clock In:</strong> {emp.clock_in ? new Date(emp.clock_in).toLocaleTimeString() : "Not clocked in"}</p>
                                <p><strong>Clock Out:</strong> {emp.clock_out ? new Date(emp.clock_out).toLocaleTimeString() : "Not clocked out"}</p>
                                <p><strong>Break Time:</strong> {emp.break_time} </p>
                            </div>
                            <div className="flex space-x-2">
                                {!emp.clock_out ? (
                                    <>
                                        <Button
                                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                                            onClick={() => handleClock(emp.id, "clock_in")}
                                            disabled={!!emp.clock_in}
                                        >
                                            Clock In
                                        </Button>
                                        <Button
                                            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                                            onClick={() => toggleBreakStatus(emp.id, emp.status)}
                                            disabled={!emp.clock_in || !!emp.clock_out}
                                        >
                                            {emp.status === "active" ? "Go on Break" : "Resume Work"}
                                        </Button>
                                        <Button
                                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                            onClick={() => handleClock(emp.id, "clock_out")}
                                            disabled={!emp.clock_in || !!emp.clock_out}
                                        >
                                            Clock Out
                                        </Button>
                                    </>
                                ) : (
                                    <p className="font-bold text-lg text-blue-600">Total Time: {emp.total_time}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center">No employees found...</p>
            )}
        </div>
    );
}

export default ManageEmp;

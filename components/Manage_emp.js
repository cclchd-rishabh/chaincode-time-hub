import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, MoreVertical, Edit, ChevronDown } from "lucide-react";
import { FormPane } from "./FormPane";

function ManageEmp() {
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchEmployees = async () => {
        try {
            const response = await fetch("/api/fetch");
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            // Add API call to create a new employee
            const response = await fetch("/api/fetch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            
            if (!response.ok) throw new Error("Failed to add employee");
            
            // Refresh
            await fetchEmployees();
            
            setIsFormOpen(false);
        } catch (error) {
            console.error("Error adding employee:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        // Reset to first page when entries per page changes or when search query changes
        setCurrentPage(1);
    }, [entriesPerPage, searchQuery]);

    const handleOpenForm = () => {
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
    };
  
    const updateBackendTime = async (id, type, value) => {
        console.log( type," - ",value);
        try {
            const response = await fetch(`/api/fetch?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [type]: value }),
            });
            if (!response.ok) throw new Error("Failed to update time in backend");
        } catch (error) {
            console.error("Error updating time in backend:", error);
        }
    };

    const handleBreak = async (id) => {
        try {
            const employee = employees.find((emp) => emp.id === id);
            const newStatus = employee.status === "active" ? "inactive" : "active";
            const breakEndTime = newStatus === "active" ? new Date().toISOString() : null;

            await toggleBreakStatus(id, newStatus);
            await updateBackendTime(id, "status", newStatus);
            if (breakEndTime) {
                await updateBackendTime(id, "break_end", breakEndTime);
                await updateBackendTime(id, "breakToggle", false);
            }
            await fetchEmployees();
        } catch (error) {
            console.error("Error handling break:", error);
        }
    };

    const handleClock = async (id, type, time) => {
        try {
            if (type === "clock_out") {
                const status = "day-over";
                toggleBreakStatus(id, status);
            }
            else {
                const status = type;
                toggleBreakStatus(id, status);
            }
           
            const response = await fetch(`/api/fetch?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [type]: true }),
            });
            if (!response.ok) throw new Error("Failed to update time");
            await updateBackendTime(id, type, time);
            await fetchEmployees();
        } catch (error) {
            console.error("Error updating time:", error);
        }
    };

    const toggleBreakStatus = async (id, currentStatus) => {
        try {
            console.log(currentStatus);
            let newStatus = currentStatus === "active" ? "inactive" : "active";
            if (currentStatus === "day-over") {
                newStatus = "day-over";
            }
            const response = await fetch(`/api/fetch?id=${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error("Failed to update break status");
            
            await updateBackendTime(id, "status", newStatus);
            await fetchEmployees();
        } catch (error) {
            console.error("Error updating break status:", error);
        }
    };

    // Filter employees based on search query
    const filteredEmployees = employees.filter(emp =>
        (emp.first_name + " " + emp.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination calculation
    const totalPages = Math.ceil(filteredEmployees.length / entriesPerPage);
    const indexOfLastEmployee = currentPage * entriesPerPage;
    const indexOfFirstEmployee = indexOfLastEmployee - entriesPerPage;
    const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

    // Handle pagination
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // Generate page numbers
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    // Generate initials from name if avatar is not available
    const getInitials = (firstName, lastName) => {
        return (firstName?.[0] || '') + (lastName?.[0] || '');
    };

    // Get status color based on employee status
    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-yellow-100 text-yellow-800';
            case 'resigned':
                return 'bg-orange-100 text-orange-800';
            case 'not-present':
                return 'bg-red-100 text-red-800';
            case 'day-over':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="w-full mx-auto p-6 bg-white shadow">
            {/* Header with title and action buttons */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-gray-800">Validating Peers, One Employee at a Time</h1>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center text-white gap-2 bg-blue-600 hover:bg-blue-700 hover:text-white">
                        Export <ChevronDown size={16} />
                    </Button>

                    <Button onClick={handleOpenForm} className="bg-blue-600 hover:bg-blue-700 text-white" >
                        Add New Record
                    </Button>
                </div>
            </div>

            {/* Table controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <div className="flex items-center mb-4 sm:mb-0">
                    <span className="text-black mr-2">Show</span>
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none"
                            value={entriesPerPage}
                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                        >
                            <option value={2}>2</option>
                            <option value={5}>5</option>
                            <option value={15}>15</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    <span className="text-black ml-2">entries</span>
                </div>
                <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">Search:</span>
                    </div>
                    <input
                        type="text"
                        className="pl-20 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none w-full sm:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            {filteredEmployees.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="w-12 px-6 py-3 text-left">
                                    <input type="checkbox" className="h-4 w-4" />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    NAME
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    EMAIL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    DATE
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    TIME STATUS
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    STATUS
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input type="checkbox" className="h-4 w-4" />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {emp.avatar ? (
                                                <img
                                                    src={emp.avatar}
                                                    alt={`${emp.first_name} ${emp.last_name}`}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-gray-300">
                                                    {getInitials(emp.first_name, emp.last_name)}
                                                </div>
                                            )}
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{emp.first_name} {emp.last_name}</div>
                                                <div className="text-sm text-gray-500">{emp.role} {emp.department ? `- ${emp.department}` : ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {emp.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {emp.clock_in ? new Date(emp.clock_in).toLocaleDateString() : "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {emp.clock_out ? (
                                            <span className="font-semibold text-blue-600">Total: {emp.total_time}</span>
                                        ) : (
                                            <div className="text-xs space-y-1">
                                                <p>In: {emp.clock_in ? new Date(emp.clock_in).toLocaleTimeString() : "Not clocked in"}</p>
                                                <p>Break: {emp.break_time || "0 min"}</p>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(emp.status)}`}>
                                            {emp.status === "active" ? "Active" : emp.status === "inactive" ? "On Break" : emp.status === "not-present" ? "Inactive" : emp.status === "day-over" ? "Finished" : emp.status || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {!emp.clock_out ? (
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-500 text-white hover:bg-green-600"
                                                    onClick={() => handleClock(emp.id, "clock_in", new Date().toISOString())}
                                                    disabled={!!emp.clock_in}
                                                >
                                                    Clock In
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-yellow-500 text-white hover:bg-yellow-600"
                                                    onClick={() => handleBreak(emp.id)}
                                                    disabled={!emp.clock_in || !!emp.clock_out}
                                                >
                                                    {emp.status === "active" ? "Break" : "Resume"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-red-500 text-white hover:bg-red-600"
                                                    onClick={() => handleClock(emp.id, "clock_out", new Date().toISOString())}
                                                    disabled={!emp.clock_in || !!emp.clock_out}
                                                >
                                                    Clock Out
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-4">
                                                <button className="text-gray-500 hover:text-gray-700">
                                                    <MoreVertical size={18} />
                                                </button>
                                                <button className="text-blue-500 hover:text-blue-700">
                                                    <Edit size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination controls */}
                    <div className="mt-4 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                            Showing {filteredEmployees.length === 0 ? 0 : indexOfFirstEmployee + 1} to {Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} entries
                        </div>
                        <div className="flex space-x-2">
                            <button 
                                className={`px-3 py-1 border border-gray-300 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} text-sm`}
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            
                            {pageNumbers.map(number => (
                                <button 
                                    key={number}
                                    className={`px-3 py-1 border border-gray-300 rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'} text-sm`}
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </button>
                            ))}
                            
                            <button 
                                className={`px-3 py-1 border border-gray-300 rounded-md ${currentPage === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'} text-sm`}
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-center py-8">No employees found...</p>
            )}
            
            <FormPane 
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}

export default ManageEmp;
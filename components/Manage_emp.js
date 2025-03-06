import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, MoreVertical, Edit, ChevronDown } from "lucide-react";
import { FormPane } from "./FormPane";
import { createEmployee, getAllEmployees, empClockedIn, empClockedOut, empBreakStart, empBreakEnd } from "/pages/api/fetch";
import * as XLSX from "xlsx";
function ManageEmp() {
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

const exportToExcel = (data, fileName = "Employee_Attendance.xlsx") => {
    if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
    }
    console.log("consoled")
    // Map JSON to a simplified structure (only required fields)
    const formattedData = data.map(emp => ({
        "Employee ID": emp.employee_id,
        "First Name": emp.first_name,
        "Last Name": emp.last_name,
        "Email": emp.email,
        "Department": emp.department,
        "Role": emp.role,
        "Attendance Date": emp.attendance_date?.split(" ")[0] || "N/A", // Extracts only date
        "Clock In": emp.clock_in || "N/A",
        "Clock Out": emp.clock_out || "N/A",
        "Total Work Time": emp.total_work_time || "00:00:00",
        "Total Break Time": emp.total_break_time || "00:00:00",
        "Status": emp.attendance_status || "N/A",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    // Create and trigger the download
    XLSX.writeFile(workbook, fileName);
};

    const fetchEmployees = async () => {
        const data = await getAllEmployees();
        console.log("data", data);
        setEmployees(data);
    };

    const handleFormSubmit = async (formData) => {
        try {
            const data = await createEmployee(formData);
            console.log("next-line");
            setIsFormOpen(false);
            await fetchEmployees();
        } catch (error) {
            console.error("Error creating employee:", error);
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



    // const handleBreak = async (id) => {
    //     console.log(employees);
    //     if(employees.id.break_status == 'false'){
    //         breakStart(id);
    //     }else{
    //         breakEnd(id);
    //     }
    // };
    const handleBreak = async (id) => {
        console.log(employees); // Debugging step to check employees data

        // Find the employee in the array
        const employee = employees.find(emp => emp.employee_id === id);

        if (!employee) {
            console.error("Employee not found!");
            return;
        }

        // Ensure break_status exists before checking it
        if (employee.break_status === null || employee.break_status === "false" || employee.break_status === "completed") {
            console.log(employee.break_status);
            console.log("start-break ke code mai");
            await breakStart(employee.attendance_id);
            fetchEmployees();
        } else {
            console.log(employee.break_status);
            console.log("end-break ke code mai");
            await breakEnd(employee.attendance_id);
            fetchEmployees();
        }
    };

    async function breakEnd(id) {
        try {
            const res = await empBreakEnd(id);
            console.log(res);
        } catch (e) {
            console.log(e);
        }
    }
    async function breakStart(id) {
        try {
            const res = await empBreakStart(id);
            console.log(res);
        } catch (e) {
            console.log(e)
        }
    }

    const handleClock = async (id) => {
        try {
            if (type === "clock_out") {
                const status = "day-over";
                toggleBreakStatus(id, null, status);
            }
            else {
                const status = type;
                toggleBreakStatus(id, null, status);
            }
            console.log(`Making PUT request to /api/fetch?id=${id} with body:`, { [type]: true });
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

    // const toggleBreakStatus = async (id, attendance, currentStatus) => {
    //     try {
    //         console.log(currentStatus);
    //         const response = await fetch(`/api/fetch?id=${id}`, {
    //             method: "PUT",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 status: currentStatus,
    //                 attendance_id: attendance
    //             }),
    //         });
    //         if (!response.ok) throw new Error("Failed to update break status");
    //         await fetchEmployees();
    //     } catch (error) {
    //         console.error("Error updating break status:", error);
    //     }
    // };

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

    async function handleClockIn(id) {
        try {
            console.log("Handle Clock in");
            const res = await empClockedIn(id);
            await fetchEmployees();
            console.log(res);
        } catch (e) {
            console.error(e)
        }
    }
    async function handleClockOut(id) {
        try {
            console.log("Handle Clock out");
            const res = await empClockedOut(id);
            await fetchEmployees();
            console.log(res);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="w-full mx-auto p-6 bg-white shadow">
            {/* Header with title and action buttons */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold text-gray-800">Validating Peers, One Employee at a Time</h1>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center text-white gap-2 bg-blue-600 hover:bg-blue-700 hover:text-white" onClick={() => exportToExcel(employees)}>
                        Export 
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
                                <tr key={emp.employee_id} className="hover:bg-gray-50">
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
                                        {emp.clock_in ? emp.attendance_date.split(" ")[0] : "N/A"}
                                    </td>

                                    <td className="px-3 py-3 text-sm text-gray-500">
                                        {emp.clock_out ? (
                                            <div className="flex flex-col gap-2 max-w-xs mx-auto">
                                                <div className="text-center">
                                                    <span className="text-xs font-medium text-gray-700 block mb-1">Net Work</span>
                                                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded-md text-xs inline-block w-full text-center">
                                                        {emp.total_time}
                                                    </span>
                                                </div>

                                                <div className="text-center">
                                                    <span className="text-xs font-medium text-gray-700 block mb-1">Break Time</span>
                                                    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-md text-xs inline-block w-full text-center">
                                                        {emp.total_break_time}
                                                    </span>
                                                </div>

                                                <div className="text-center">
                                                    <span className="text-xs font-medium text-gray-700 block mb-1">Total Time</span>
                                                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-md text-xs inline-block w-full text-center">
                                                        {emp.total_work_time}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full"></div>
                                                <span className="text-xs">
                                                    In: {emp.clock_in ? new Date(emp.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not clocked in"}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(emp.attendance_status)}`}>
                                            {emp.attendance_status === "active" ? "Active" : emp.attendance_status === "inactive" ? "On Break" : emp.attendance_status === "not-present" ? "Inactive" : emp.attendance_status === "day-over" ? "Finished" : emp.attendance_status || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {!emp.clock_out ? (
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-500 text-white hover:bg-green-600"
                                                    onClick={() => handleClockIn(emp.employee_id)}
                                                    disabled={!!emp.clock_in}
                                                >
                                                    Clock In
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-yellow-500 text-white hover:bg-yellow-600"
                                                    onClick={() => handleBreak(emp.employee_id)}
                                                    disabled={!emp.clock_in || !!emp.clock_out}
                                                >
                                                    {emp.attendance_status === "active" ? "Break" : "Resume"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-red-500 text-white hover:bg-red-600"
                                                    onClick={() => handleClockOut(emp.employee_id)}
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
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Download, Plus, ArrowLeft, ArrowRight, Clock, Coffee, LogOut ,ChevronDown} from "lucide-react";
import { FormPane } from "./FormPane";
import { createEmployee, empClockedIn, empClockedOut, empBreakStart, empBreakEnd, getDatewiseAttendance } from "/pages/api/fetch";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function ManageEmp() {
    // Get date from URL param if available, otherwise use current date
    const getInitialDate = () => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const dateParam = urlParams.get('date');
            if (dateParam) {
                const parsedDate = new Date(dateParam);
                return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
            }
        }
        return new Date();
    };

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(15);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState(getInitialDate);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refresh, setRefresh] = useState(false);

    const exportToExcel = (data, fileName = `Employee_Attendance_${selectedDate.toISOString().split('T')[0]}.xlsx`) => {
        if (!data || data.length === 0) {
            alert("No data available to export.");
            return;
        }

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
        XLSX.writeFile(workbook, fileName);
    };

    const handleFormSubmit = async (formData) => {
        try {
            await createEmployee(formData);
            setIsFormOpen(false);
            await fetchAttendanceData(selectedDate);
        } catch (error) {
            console.error("Error creating employee:", error);
        }
    };

    const fetchAttendanceData = async (date = new Date()) => {
        setLoading(true);
        setError(null);
        try {
            const dateString = date.toISOString().split('T')[0];
            const data = await getDatewiseAttendance(dateString);
            setEmployees(data);
        } catch (error) {
            setError("Failed to fetch attendance data.");
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    // Update URL when date changes
    const updateUrlWithDate = (date) => {
        if (typeof window !== 'undefined') {
            const dateStr = date.toISOString().split('T')[0];
            const url = new URL(window.location);
            url.searchParams.set('date', dateStr);
            window.history.pushState({}, '', url);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = sessionStorage.getItem("token");
            setIsAuthenticated(!!token); // Convert token existence to boolean
        }
        if (selectedDate) {
            fetchAttendanceData(selectedDate);
            updateUrlWithDate(selectedDate);
        } else {
            // If no date is selected, use today's date
            const today = new Date();
            setSelectedDate(today);
            fetchAttendanceData(today);
            updateUrlWithDate(today);
        }
    }, [selectedDate, refresh]);

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

    const handleBreak = async (id) => {
        // Find the employee in the array
        const employee = employees.find(emp => emp.employee_id === id);

        if (!employee) {
            console.error("Employee not found!");
            return;
        }

        // Ensure break_status exists before checking it
        if (employee.break_status === null || employee.break_status === "false" || employee.break_status === "completed") {
            await breakStart(employee.attendance_id);
        } else {
            await breakEnd(employee.attendance_id);
        }
        await fetchAttendanceData(selectedDate);
    };

    async function breakEnd(id) {
        try {
            await empBreakEnd(id);
            setRefresh(!refresh);
        } catch (e) {
            console.error(e);
        }
    }

    async function breakStart(id) {
        try {
            await empBreakStart(id);
            setRefresh(!refresh);
        } catch (e) {
            console.error(e);
        }
    }

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
            await empClockedIn(id);
            setRefresh(!refresh);
        } catch (e) {
            console.error(e);
        }
    }

    async function handleClockOut(id) {
        try {
            await empClockedOut(id);
            setRefresh(!refresh);
        } catch (e) {
            console.error(e);
        }
    }

    // Function to handle date change
    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    return (
        <div className="w-full mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="max-w-9xl mx-auto bg-white rounded-xl shadow-sm">
                {/* Header with title and action buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Attendance Dashboard</h1>
                        <p className="text-gray-500 mt-1">Track and manage employee time records</p>
                    </div>
                    <div className="flex gap-3 mt-4 sm:mt-0">

                        <div className="flex items-center gap-4">
                            <div>
                                {/* <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label> */}
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    dateFormat="yyyy-MM-dd"
                                    maxDate={new Date()}
                                    className="p-2 border rounded-lg w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center relative">
                            <input
                                type="text"
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                            onClick={() => exportToExcel(employees)}
                        >
                            <Download size={16} />
                            Export Data
                        </Button>
                        {loading && (
                            <div className="mt-4 flex items-center text-blue-600">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading attendance data...
                            </div>
                        )}
                        {error && (
                            <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                    </div>
                </div>

                {/* Filters and controls */}
                {/* <div className="p-6 border-b">
                 
                </div> */}

                {/* Data Table */}
                <div className="flex flex-col overflow-x-auto overflow-y-auto min-h-[70vh] max-h-[70vh]">

                {/* <div className="overflow-x-auto min-h-96"> */}
                    {filteredEmployees.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50 sticky top-0">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Time Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200 ">
                                {currentEmployees.map((emp) => (
                                    <tr key={emp.employee_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {emp.avatar ? (
                                                    <img
                                                        src={emp.avatar}
                                                        alt={`${emp.first_name} ${emp.last_name}`}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-600">
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
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {emp.clock_out ? (
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-medium text-gray-700 mb-1">Net Work</span>
                                                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-md text-xs whitespace-nowrap">
                                                            {emp.total_time}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-medium text-gray-700 mb-1">Break</span>
                                                        <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-md text-xs whitespace-nowrap">
                                                            {emp.total_break_time}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col items-center">
                                                        <span className="text-xs font-medium text-gray-700 mb-1">Total</span>
                                                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-xs whitespace-nowrap">
                                                            {emp.total_work_time}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${emp.clock_in ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                                                    <span className="text-sm">
                                                        {emp.clock_in ? `Clocked in at ${emp.clock_in}` : "Not clocked in"}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(emp.attendance_status)}`}>
                                                {emp.attendance_status === "active" ? "Active" :
                                                    emp.attendance_status === "inactive" ? "On Break" :
                                                        emp.attendance_status === "not-present" ? "Inactive" :
                                                            emp.attendance_status === "day-over" ? "Finished" :
                                                                emp.attendance_status || "Unknown"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {!emp.clock_out ? (
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        className={`flex items-center gap-1 ${!!emp.clock_in ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                                        onClick={() => handleClockIn(emp.employee_id)}
                                                        disabled={!!emp.clock_in}
                                                    >
                                                        <Clock size={14} />
                                                        Clock In
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className={`flex items-center gap-1 ${!emp.clock_in || !!emp.clock_out ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                                                        onClick={() => handleBreak(emp.employee_id)}
                                                        disabled={!emp.clock_in || !!emp.clock_out}
                                                    >
                                                        <Coffee size={14} />
                                                        {emp.attendance_status === "active" ? "Break" : "Resume"}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className={`flex items-center gap-1 ${!emp.clock_in || !!emp.clock_out ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                                                        onClick={() => handleClockOut(emp.employee_id)}
                                                        disabled={!emp.clock_in || !!emp.clock_out}
                                                    >
                                                        <LogOut size={14} />
                                                        Clock Out
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">
                                                    Day completed
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="bg-gray-100 rounded-full p-4 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-600">No employees found</p>
                            <p className="mt-1 text-gray-500">Try adjusting your search or date filters</p>
                          
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {filteredEmployees.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                        <div className="flex items-center mb-4 sm:mb-0">
                        <span className="text-black mr-2">Show</span>
                        <div className="relative">
                            <select
                                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 focus:outline-none"
                                value={entriesPerPage}
                                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                        <span className="text-black ml-2">entries</span>
                    </div>
                        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                            Showing <span className="font-medium">{indexOfFirstEmployee + 1}</span> to <span className="font-medium">{Math.min(indexOfLastEmployee, filteredEmployees.length)}</span> of <span className="font-medium">{filteredEmployees.length}</span> entries
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className={`flex items-center gap-1 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                            >
                                <ArrowLeft size={14} />
                                Previous
                            </Button>

                            <div className="flex items-center space-x-1">
                                {pageNumbers.map(number => (
                                    <Button
                                        key={number}
                                        variant={currentPage === number ? "default" : "outline"}
                                        size="sm"
                                        className={`min-w-[2.5rem] px-3 py-1 ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                                        onClick={() => paginate(number)}
                                    >
                                        {number}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className={`flex items-center gap-1 ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Next
                                <ArrowRight size={14} />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <FormPane
                isOpen={isFormOpen}
                onClose={handleCloseForm}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}

export default ManageEmp;
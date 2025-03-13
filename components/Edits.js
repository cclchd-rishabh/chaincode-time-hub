import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Search, Edit, Trash2, Plus, X, ChevronDown } from "lucide-react";
import { editEmployees, createEmployee, deleteEmployee, getAllEmployees } from "@/pages/api/fetch";
import { Button } from "@/components/ui/button";

const roleOptions = {

    HR: ["Manager (Senior)", "Head HR (Senior)", "HR Executive (Junior)", "HR Executive (Senior)", "Intern (Intern)"],
    Engineering: [
        "Full Stack Developer (Junior)", "Full Stack Developer (Senior)", "Full Stack Developer (Tech Lead)", "Full Stack Developer (Intern)",
        "Backend Developer (Junior)", "Backend Developer (Senior)", "Backend Developer (Tech Lead)", "Backend Developer (Intern)",
        "Blockchain Developer (Junior)", "Blockchain Developer (Senior)", "Blockchain Developer (Tech Lead)", "Blockchain Developer (Intern)",
        "Frontend Developer (Junior)", "Frontend Developer (Senior)", "Frontend Developer (Tech Lead)", "Frontend Developer (Intern)",
        "DevOps (Junior)", "DevOps (Senior)", "DevOps (Tech Lead)", "DevOps (Intern)"
    ],
    Sales: ["Sales Executive (Junior)", "Sales Executive (Senior)", "Sales Manager (Senior)", "Business Development (Junior)", "Business Development (Senior)", "Intern (Intern)"],
    Marketing: ["Marketing Lead (Senior)", "SEO Specialist (Junior)", "SEO Specialist (Senior)", "Content Writer (Junior)", "Content Writer (Senior)", "Intern (Intern)"],

};


function EmpEdit() {
    const [employees, setEmployees] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    

    // Helper function for generating initials from names
    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`;
    };


    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllEmployees();
            setEmployees(data);
        } catch (error) {
            setError("Failed to fetch Employees data")
            console.error("Error fetching employees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        setCurrentPage(1);
    }, [entriesPerPage, searchQuery]);

    useEffect(() => {
        fetchEmployees();
    }, [refresh]);

    const validationSchema = Yup.object({
        first_name: Yup.string().required("First Name is required").max(20, "Must be 20 characters or less"),
        last_name: Yup.string().max(20, "Must be 20 characters or less"),
        email: Yup.string().email("Invalid email format").required("Email is required").max(50, "Must be 50 characters or less"),
        avatar: Yup.string().url("Invalid URL"),
        department: Yup.string().required("Department is required"),
        role: Yup.string().required("Role is required"),
    });

    const handleEdit = (id) => {
        try {
            const employee = employees.find((emp) => emp.employee_id === id);
            if (!employee) {
                setError("Employee not found")
                console.error("Employee not found");
                return;
            }
            setEditEmployee(employee);
            setShowModal(true);
        } catch (error) {
            console.Error("Error cannot edit")
            console.error("Error setting up edit:", error);
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

    const handleDelete = async (id) => {
        try {
            if (window.confirm("Are you sure you want to delete this employee?")) {
                const data = await deleteEmployee(id);
                setRefresh(!refresh);
            }
        } catch (error) {
            setError("Error deleting employees")
            console.error("Error deleting employee:", error);
        }
    };

    const handleSubmit = async (values, { resetForm }) => {
        setLoading(true);
        try {
            console.log("these values ->", values);
            if (editEmployee && editEmployee.employee_id) {
                await editEmployees(editEmployee.employee_id, values);
            } else {
                await createEmployee(values);
            }
            setRefresh(!refresh);
            setEditEmployee(null);
            setShowModal(false);
            resetForm();
        } catch (error) {
            setError("Error Saving Employee")
            console.error("Error saving employee:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNew = () => {
        setEditEmployee(null);
        setShowModal(true);
    };

    return (
        <div className="w-full mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header and Add Button */}
            <div className="max-w-9xl mx-auto bg-white rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Employees Dashboard</h1>
                        <p className="text-gray-500 mt-1">Track and manage employee</p>
                    </div>
                    <div className="flex gap-3 mt-4 sm:mt-0">

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
                            onClick={handleAddNew}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Employee
                        </Button>
                        {loading && (
                            <div className="mt-4 flex items-center text-blue-600">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading Employees data...
                            </div>
                        )}
                        {error && (
                            <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                    </div>
                </div>
                {/* Data Table */}
                {filteredEmployees.length > 0 ? (
                    <div className="flex flex-col overflow-x-auto overflow-y-auto min-h-[70vh] max-h-[70vh]">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50 bg-gray-50 sticky top-0 z-10">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentEmployees.map((emp) => (
                                    <tr key={emp.employee_id} className="hover:bg-gray-50">
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
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {emp.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {emp.department || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {emp.role || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(emp.employee_id)}
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-white p-1.5 rounded text-xs flex items-center justify-center">
                                                    <Edit size={14} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(emp.employee_id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded text-xs flex items-center justify-center">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                ) : (<></>)}

                {filteredEmployees.length > 0 ? (
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

                        <div className="text-sm text-gray-500">
                            Showing {filteredEmployees.length === 0 ? 0 : indexOfFirstEmployee + 1} to{" "}
                            {Math.min(indexOfLastEmployee, filteredEmployees.length)} of{" "}
                            {filteredEmployees.length} entries
                        </div>

                        <div className="flex space-x-2">
                            <button
                                className={`px-3 py-1 border border-gray-300 rounded-md ${currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                    } text-sm`}
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            {pageNumbers.map((number) => (
                                <button
                                    key={number}
                                    className={`px-3 py-1 border border-gray-300 rounded-md ${currentPage === number
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                        } text-sm`}
                                    onClick={() => paginate(number)}
                                >
                                    {number}
                                </button>
                            ))}

                            <button
                                className={`px-3 py-1 border border-gray-300 rounded-md ${currentPage === totalPages || totalPages === 0
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                    } text-sm`}
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center py-8">No employees found...</p>
                )}



                {/* Modal Form */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                            <h3 className="text-lg font-semibold mb-4">
                                {editEmployee ? "Edit Employee" : "Add New Employee"}
                            </h3>
                            <Formik
                                initialValues={{
                                    first_name: editEmployee?.first_name || "",
                                    last_name: editEmployee?.last_name || "",
                                    email: editEmployee?.email || "",
                                    department: editEmployee?.department || "",
                                    role: editEmployee?.role || "",
                                    avatar: editEmployee?.avatar || "",  // Keep avatar instead of image
                                }}
                                validationSchema={validationSchema} // Ensuring validation is intact
                                onSubmit={handleSubmit}
                                enableReinitialize
                            >
                                {({ setFieldValue, values, isSubmitting }) => (
                                    <Form className="space-y-4">
                                        {/* First Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <Field type="text" name="first_name" className="w-full p-2 border rounded-lg" />
                                            <ErrorMessage name="first_name" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Last Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Name
                                            </label>
                                            <Field type="text" name="last_name" className="w-full p-2 border rounded-lg" />
                                            <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <Field type="email" name="email" className="w-full p-2 border rounded-lg" />
                                            <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Avatar Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Avatar URL
                                            </label>
                                            <Field type="text" name="avatar" className="w-full p-2 border rounded-lg" />
                                            <ErrorMessage name="avatar" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Department Dropdown */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Department <span className="text-red-500">*</span>
                                            </label>
                                            <Field
                                                as="select"
                                                name="department"
                                                className="w-full p-2 border rounded-lg"
                                                onChange={(e) => {
                                                    const department = e.target.value;
                                                    setFieldValue("department", department);
                                                    setFieldValue("role", ""); // Reset role when department changes
                                                    setSelectedDepartment(department);
                                                }}
                                            >
                                                <option value="" disabled>Select Department</option>
                                                {Object.keys(roleOptions).map((dept) => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="department" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Role Dropdown */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Role <span className="text-red-500">*</span>
                                            </label>
                                            <Field
                                                as="select"
                                                name="role"
                                                className="w-full p-2 border rounded-lg"
                                                onChange={(e) => setFieldValue("role", e.target.value)}
                                                disabled={!selectedDepartment}
                                            >
                                                <option value="" disabled>Select Role</option>
                                                {selectedDepartment &&
                                                    roleOptions[selectedDepartment]?.map((role) => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))
                                                }
                                            </Field>
                                            <ErrorMessage name="role" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex justify-end space-x-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                                            >
                                                {isSubmitting ? "Saving..." : (editEmployee ? "Update" : "Create")}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>

                        </div>

                    </div>
                )}

            </div>
        </div>

    )
}

export default EmpEdit;
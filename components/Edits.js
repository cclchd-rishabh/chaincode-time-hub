import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Search, Edit, Trash2, Plus, X, ChevronDown } from "lucide-react";
import { editEmployees, createEmployee, deleteEmployee, getAllEmployees } from "/lib/api/employee";
import { Button } from "@/components/ui/button";

const roleOptions = {
    "HR and People Management": [
        "Manager - (Team ICE)",
        "Senior Executive - Inclusion & Culture",
        "Executive - Inclusion & Culture",
        "Intern"
    ],
    "Business Growth": [
        "Manager",
        "Senior Executive",
        "Executive",
        "Intern"
    ],
    "Quality Analysis": [
        "Senior QA",
        "Quality Analyst",
        "Trainee QA"
    ],
    "Full Stack Development": [
        "Senior Developer",
        "Junior Developer",
        "Intern"
    ],
    "Blockchain Development": [
        "Senior Blockchain Developer",
        "Junior Blockchain Developer",
        "Intern"
    ],
    "Graphic Designing": [
        "Senior Designer",
        "Junior Designer",
        "Intern"
    ],
    "System Administration": [
        "Dev Ops Engineer",
        "Intern"
    ],
    "Management": [
        "CEO",
        "Director",
        "CTO"
    ],
    "Wild Wheat Bakery": [
        "HR CUM ACCOUNT EXECUTIVE",
        "ACCOUNT EXECUTIVE",
        "HR"
    ],
    "Supporting Staff":[
        "Office Help"
    ]
};


function EmpEdit() {
    const [employees, setEmployees] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [entriesPerPage, setEntriesPerPage] = useState(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [workLocation, setWorkLocation] = useState("");

    
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
        emp_id: Yup.string().required("Employee ID is required").max(20, "Must be 20 characters or less"),
        first_name: Yup.string().required("First Name is required").max(20, "Must be 20 characters or less"),
        last_name: Yup.string().max(20, "Must be 20 characters or less"),
        email: Yup.string().email("Invalid email format").required("Email is required").max(50, "Must be 50 characters or less"),
        avatar: Yup.mixed().nullable().notRequired()
            .test('fileSize', 'File size must be less than 10MB', (value) => {
                if (!value) return true; // Allow empty values
                return value.size <= 10 * 1024 * 1024; // 10MB
            })
            .test('fileType', 'Unsupported file format', (value) => {
                if (!value) return true; // Allow empty values
                return ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'].includes(value.type);
            }),
        department: Yup.string().required("Department is required"),
        role: Yup.string().required("Role is required"),
        work_location: Yup.string().required("Work Location is required"),
    });
    const handleEdit = (id) => {
        try {
            console.log("Handle edit called" , id);
            const employee = employees.find((emp) => emp.employee_id === id);
            if (!employee) {
                setError("Employee not found")
                console.error("Employee not found");
                return;
            }
            console.log(employee);
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
        emp.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.emp_id?.toLowerCase().includes(searchQuery.toLowerCase())
       
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
    const handleSubmit = async (values, { resetForm }) => {
        const formValues = { ...values };
        setLoading(true);
    
        try {
            const formData = new FormData();
            formData.append("emp_id",formValues.emp_id);
            formData.append("first_name", formValues.first_name);
            formData.append("last_name", formValues.last_name);
            formData.append("email", formValues.email);
            formData.append("department", formValues.department);
            formData.append("role", formValues.role);
            formData.append("work_location", formValues.work_location);
    
            if (formValues.avatar) {
                formData.append("avatar", formValues.avatar);
            }
    
            if (editEmployee && editEmployee.employee_id) {
                await editEmployees(editEmployee.employee_id, formData);
            } else {
                await createEmployee(formData);
            }
    
            setRefresh(!refresh);
            setEditEmployee(null);
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error saving employee:", error);
        } finally {
            setLoading(false);
        }
    };
    

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

    const handleAddNew = () => {
        setEditEmployee(null);
        setShowModal(true);
    };

    return (
        <div className="w-full mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="max-w-9xl mx-auto bg-white rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Employees Dashboard</h1>
                        <p className="text-gray-500 mt-1">Track and manage employee</p>
                    </div>
                    <div className="flex gap-3 mt-4 sm:mt-0">

                    <div className="flex items-center gap-4">
  <div className="flex items-center relative w-full">
    <input
      type="text"
      className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full h-10"
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
    className="bg-blue-500 hover:bg-blue-600 text-white px-4 h-10 rounded-md flex items-center gap-2"
  >
    <Plus size={16} />
    Add Employee
  </Button>
</div>

                        {loading && (
                            <div className="flex justify-center items-center h-64">
                            <div className="flex flex-col items-center">
                                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-gray-600">Loading Employees data...</p>
                            </div>
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
                                        Employee ID
                                    </th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {emp.emp_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {emp.avatar ? (
                                                    <img
                                                        src={`https://timehub-api.chaincodeconsulting.com${emp.avatar}`}
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
        emp_id: editEmployee?.emp_id || "",
        first_name: editEmployee?.first_name || "",
        last_name: editEmployee?.last_name || "",
        email: editEmployee?.email || "",
        department: editEmployee?.department || "",
        role: editEmployee?.role || "",
        work_location: editEmployee?.work_location || "",
        avatar: null,
    }}
    validationSchema={validationSchema}
    onSubmit={handleSubmit}
    enableReinitialize
>
    {({ setFieldValue, isSubmitting }) => (
        <div className="fixed inset-0 backdrop-blur-md bg-gray-900/60 flex items-center justify-center z-50">
            <Form className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                        {editEmployee ? "Edit Employee" : "Create Employee"}
                    </h2>
                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Employee ID <span className="text-red-500">*</span>
                    </label>
                    <Field 
                        type="text" 
                        name="emp_id" 
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" 
                    />
                    <ErrorMessage name="emp_id" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            First Name <span className="text-red-500">*</span>
                        </label>
                        <Field 
                            type="text" 
                            name="first_name" 
                            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" 
                        />
                        <ErrorMessage name="first_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Last Name
                        </label>
                        <Field 
                            type="text" 
                            name="last_name" 
                            className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" 
                        />
                        <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <Field 
                        type="email" 
                        name="email" 
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600" 
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Work Location <span className="text-red-500">*</span>
                    </label>
                    <Field
                        as="select"
                        name="work_location"
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        onChange={(e) => setFieldValue("work_location", e.target.value)}
                    >
                        <option value="" disabled>Select Work Location</option>
                        <option value="in-office">Onsite</option>
                        <option value="remote">Remote</option>
                    </Field>
                    <ErrorMessage name="work_location" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Upload Avatar
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        onChange={(event) => {
                            const file = event.currentTarget.files[0];
                            if (file && file.size <= 10 * 1024 * 1024) {
                                setFieldValue("avatar", file);
                            } else {
                                alert("File size should be under 10MB");
                            }
                        }}
                    />
                    <ErrorMessage name="avatar" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Department <span className="text-red-500">*</span>
                    </label>
                    <Field
                        as="select"
                        name="department"
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        onChange={(e) => {
                            const department = e.target.value;
                            setFieldValue("department", department);
                            setFieldValue("role", "");
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Role <span className="text-red-500">*</span>
                    </label>
                    <Field
                        as="select"
                        name="role"
                        className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
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

                <div className="flex justify-center space-x-3 mt-6">
                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2.5 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
                    >
                        {isSubmitting ? "Saving..." : editEmployee ? "Update" : "Create"}
                    </button>
                </div>
            </Form>
        </div>
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
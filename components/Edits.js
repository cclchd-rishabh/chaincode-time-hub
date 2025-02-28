import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function EmpEdit() {
    const [employees, setEmployees] = useState([]);
    const [refresh, setRefresh] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);

    useEffect(() => {
        async function fetchEmployees() {
            try {
                const response = await fetch("/api/fetch");
                const json = await response.json();
                setEmployees(json);
            } catch (error) {
                console.error("Error fetching employees:", error);
            }
        }
        fetchEmployees();
    }, [refresh]);

    const validationSchema = Yup.object({
        first_name: Yup.string().required("First Name is required").max(20, "Must be 20 characters or less"),
        last_name: Yup.string().max(20, "Must be 20 characters or less"),
        email: Yup.string().email("Invalid email format").required("Email is required").max(50,"Must be 50 characters or less"),
        avatar: Yup.string().url("Invalid URL"),
        department: Yup.string().required("Department is required").max(20, "Must be 20 characters or less"),
        role: Yup.string().required("Role is required").max(20, "Must be 20 characters or less"),
    });
    const handleEdit = async (id) => {
        const employee = employees.find((emp) => emp.id === id);
        setEditEmployee(employee);
        method = "PUT";
        const url = `/api/fetch?id=${id}`;
        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })
            setRefresh(!refresh);
            setEditEmployee(null);
            resetForm();
        } catch (error) {
            console.error("Error updating employee:", error);
        }
    }
    const handleDelete = async (id) => {
        try {
            await fetch(`/api/fetch?id=${id}`, {
                method: "DELETE",
            });
            setRefresh(!refresh);
        } catch (error) {
            console.error("Error deleting employee:", error);
        };
    }
    const handleSubmit = async (values, { resetForm }) => {
        const method = editEmployee ? "PUT" : "POST";
        const url = editEmployee ? `/api/fetch?id=${editEmployee.id}` : "/api/fetch";
        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            setRefresh(!refresh);
            setEditEmployee(null);
            resetForm();
        } catch (error) {
            console.error("Error updating employee:", error);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Employee Management</h1>

            <div className="w-full max-w-4xl grid gap-6 lg:grid-cols-2">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-black text-xl font-semibold mb-4">{editEmployee ? "Edit Employee" : "Add New Employee"}</h2>
                    <Formik
                        initialValues={{
                            first_name: editEmployee?.first_name || "",
                            last_name: editEmployee?.last_name || "",
                            email: editEmployee?.email || "",
                            avatar: editEmployee?.avatar || "",
                            department: editEmployee?.department || "",
                            role: editEmployee?.role || "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {() => (
                            <Form className="space-y-4">
                                <Field type="text" name="first_name" placeholder="First Name" className="w-full p-2 border rounded-lg" />
                                <ErrorMessage name="first_name" component="div" className="text-red-500 text-sm" />

                                <Field type="text" name="last_name" placeholder="Last Name" className="w-full p-2 border rounded-lg" />
                                <ErrorMessage name="last_name" component="div" className="text-red-500 text-sm" />

                                <Field type="email" name="email" placeholder="Email" className="w-full p-2 border rounded-lg" />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />

                                <Field type="text" name="avatar" placeholder="Avatar URL" className="w-full p-2 border rounded-lg" />
                                <ErrorMessage name="avatar" component="div" className="text-red-500 text-sm" />

                                <Field type="text" name="department" placeholder="Department" className="w-full p-2 border rounded-lg" />
                                <ErrorMessage name="department" component="div" className="text-red-500 text-sm" />

                                <Field type="text" name="role" placeholder="Role" className="w-full p-2 border rounded-lg" />
                                <ErrorMessage name="role" component="div" className="text-red-500 text-sm" />

                                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg">
                                    {editEmployee ? "Update Employee" : "Create Employee"}
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
                {/* Employee List Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-black text-xl font-semibold mb-4">Employee List</h2>
                    <div className="overflow-y-auto max-h-80 space-y-4">
                        {employees.length > 0 ? (
                            employees.map((employee) => (
                                <div key={employee.id} className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm border relative overflow-hidden">
                                    <img src={employee.avatar} alt={employee.first_name} className="w-12 h-12 rounded-full border mr-4" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{employee.first_name} {employee.last_name}</p>
                                        <p className="text-sm text-gray-600">{employee.email}</p>
                                        <p className="text-sm text-gray-500">{employee.department} - {employee.role}</p>
                                    </div>
                                    <button
                                        onClick={() => handleEdit(employee.id)}
                                        className="bg-yellow-400 hover:bg-yellow-500 text-white p-1 rounded text-xs mr-1 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 20h9" />
                                            <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
                                            <path d="m15 5 3 3" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={() => handleDelete(employee.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18" />
                                            <path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                            <path d="M10 11v6" />
                                            <path d="M14 11v6" />
                                            <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
                                        </svg>
                                    </button>

                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">No employees found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmpEdit;

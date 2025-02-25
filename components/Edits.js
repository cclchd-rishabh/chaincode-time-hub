import { useState, useEffect } from "react";

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const employee = {
            first_name: formData.get("fname"),
            last_name: formData.get("lname"),
            email: formData.get("email"),
            avatar: formData.get("avatar"),
            department: formData.get("department"),
            role: formData.get("role"),
        };

        const method = editEmployee ? "PUT" : "POST";
        const url = editEmployee ? `/api/fetch?id=${editEmployee.id}` : "/api/fetch";

        try {
            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(employee),
            });
            setRefresh(!refresh);
            setEditEmployee(null);
            e.target.reset();
        } catch (error) {
            console.error("Error updating employee:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/fetch?id=${id}`, { method: "DELETE" });
            setRefresh(!refresh);
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

    const handleEdit = (employee) => {
        setEditEmployee(employee);
        document.querySelector("[name='fname']").value = employee.first_name;
        document.querySelector("[name='lname']").value = employee.last_name;
        document.querySelector("[name='email']").value = employee.email;
        document.querySelector("[name='avatar']").value = employee.avatar;
        document.querySelector("[name='department']").value = employee.department;
        document.querySelector("[name='role']").value = employee.role;
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Employee Management</h1>

            <div className="w-full max-w-4xl grid gap-6 lg:grid-cols-2">
                {/* Form Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">{editEmployee ? "Edit Employee" : "Add New Employee"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" name="fname" placeholder="First Name" required className="w-full p-2 border rounded-lg" />
                        <input type="text" name="lname" placeholder="Last Name" required className="w-full p-2 border rounded-lg" />
                        <input type="email" name="email" placeholder="Email" required className="w-full p-2 border rounded-lg" />
                        <input type="text" name="avatar" placeholder="Avatar URL" className="w-full p-2 border rounded-lg" />
                        <input type="text" name="department" placeholder="Department" required className="w-full p-2 border rounded-lg" />
                        <input type="text" name="role" placeholder="Role" required className="w-full p-2 border rounded-lg" />
                        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded-lg">
                            {editEmployee ? "Update Employee" : "Create Employee"}
                        </button>
                    </form>
                </div>

                {/* Employee List Section */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Employee List</h2>
                    <div className="overflow-y-auto max-h-80 space-y-4">
                        {employees.length > 0 ? (
                            employees.map((employee) => (
                                <div key={employee.id} className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm border relative">
                                    <img src={employee.avatar} alt={employee.first_name} className="w-12 h-12 rounded-full border mr-4" />
                                    <div className="flex-1">
                                        <p className="font-semibold">{employee.first_name} {employee.last_name}</p>
                                        <p className="text-sm text-gray-600">{employee.email}</p>
                                        <p className="text-sm text-gray-500">{employee.department} - {employee.role}</p>
                                    </div>
                                    <button onClick={() => handleEdit(employee)} className="bg-blue-500 text-white p-1 rounded-lg text-sm mr-2">✎</button>
                                    <button onClick={() => handleDelete(employee.id)} className="bg-red-500 text-white p-1 rounded-lg text-sm">✕</button>
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

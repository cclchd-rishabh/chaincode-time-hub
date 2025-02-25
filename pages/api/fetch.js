let employees = [
  {
    id: 1,
    first_name: "George",
    last_name: "Bluth",
    email: "george@gmail.com",
    avatar: "https://reqres.in/img/faces/1-image.jpg",
    department: "Engineering",
    role: "Software Engineer",
    clock_in: null,
    clock_out: null,
  },
];

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(employees);
  } 

  else if (req.method === "POST") {
    const { first_name, last_name, email, avatar, department, role } = req.body;

    if (!first_name || !last_name || !email || !avatar || !department || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEmployee = { 
      id: employees.length + 1, 
      first_name, 
      last_name, 
      email, 
      avatar, 
      department, 
      role, 
      clock_in: null, 
      clock_out: null 
    };

    employees.push(newEmployee);
    return res.status(201).json(newEmployee);
  } 

  else if (req.method === "PUT") {
    const { id } = req.query;
    const { first_name, last_name, email, avatar, department, role, clock_in, clock_out} = req.body;
    const index = employees.findIndex(emp => emp.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ message: "Employee not found" });
    }
      employees[index] = {
        ...employees[index],
        first_name: first_name ?? employees[index].first_name,
        last_name: last_name ?? employees[index].last_name,
        email: email ?? employees[index].email,
        avatar: avatar ?? employees[index].avatar,
        department: department ?? employees[index].department,
        role: role ?? employees[index].role,
        clock_in: clock_in !== undefined ? new Date().toISOString() : employees[index].clock_in,
        clock_out: clock_out !== undefined ? new Date().toISOString() : employees[index].clock_out,
    
    }

    return res.status(200).json({ message: "Employee updated successfully", employee: employees[index] });
  } 

  else if (req.method === "DELETE") {
    const { id } = req.query;
    const index = employees.findIndex(emp => emp.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ message: "Employee not found" });
    }

    employees = employees.filter(emp => emp.id !== parseInt(id));
    return res.status(200).json({ message: "Employee deleted successfully" });
  } 

  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

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
    break_time: "0 min 0 sec",
    last_break_start: null,
    total_time: null,
    status: "active",
  },
];

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(employees);
  } 

  else if (req.method === "POST") {
    return handleCreateEmployee(req, res);
  } 

  else if (req.method === "PUT") {
    return handleUpdateEmployee(req, res);
  } 

  else if (req.method === "DELETE") {
    return handleDeleteEmployee(req, res);
  } 

  else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}

/**
 * Create a new employee
 */
function handleCreateEmployee(req, res) {
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
    clock_out: null,
    break_time: "0 min 0 sec",
    last_break_start: null,
    total_time: null,
    status: "active",
  };

  employees.unshift(newEmployee);
  return res.status(201).json(newEmployee);
}

/**
 * Update employee (Clock-in, Clock-out, Breaks, or Details)
 */
function handleUpdateEmployee(req, res) {
  const { id } = req.query;
  const { clock_in, clock_out, status, ...updates } = req.body;
  const index = employees.findIndex(emp => emp.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: "Employee not found" });
  }

  let employee = employees[index];

  // Handle Clock-In
  if (clock_in !== undefined) {
    return handleClockIn(employee, res);
  }

  // Handle Clock-Out
  if (clock_out !== undefined) {
    return handleClockOut(employee, res);
  }

  // Handle Break Start/Resume
  if (status) {
    return handleBreakStatus(employee, status, res);
  }

  // Handle General Updates
  employees[index] = { ...employee, ...updates };
  return res.status(200).json({ message: "Employee details updated successfully", employee: employees[index] });
}

/**
 * Clock-in an employee
 */
function handleClockIn(employee, res) {
  employee.clock_in = new Date().toISOString();
  employee.clock_out = null;
  employee.break_time = "0 min 0 sec";
  employee.total_time = null;
  employee.status = "active";
  employee.last_break_start = null;

  return res.status(200).json({ message: "Employee clocked in", employee });
}

/**
 * Clock-out an employee and calculate total time
 */
function handleClockOut(employee, res) {
  if (!employee.clock_in) {
    return res.status(400).json({ message: "Employee must be clocked in first" });
  }

  const totalWorkTime = new Date() - new Date(employee.clock_in);
  const netWorkTime = totalWorkTime - parseTimeToSeconds(employee.break_time) * 1000;

  employee.clock_out = new Date().toISOString();
  employee.total_time = formatTime(netWorkTime / 1000);

  return res.status(200).json({ message: "Employee clocked out", employee });
}

/**
 * Handle employee break (start or resume)
 */
function handleBreakStatus(employee, status, res) {
  if (status === "inactive" && employee.status !== "inactive") {
    employee.last_break_start = new Date().toISOString();
  } else if (status === "active" && employee.status === "inactive" && employee.last_break_start) {
    const breakDuration = (new Date() - new Date(employee.last_break_start)) / 1000;
    const updatedBreakTime = parseTimeToSeconds(employee.break_time) + breakDuration;
    employee.break_time = formatTime(updatedBreakTime);
    employee.last_break_start = null;
  }

  employee.status = status;
  return res.status(200).json({ message: "Employee status updated", employee });
}

/**
 * Delete an employee
 */
function handleDeleteEmployee(req, res) {
  const { id } = req.query;
  const index = employees.findIndex(emp => emp.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ message: "Employee not found" });
  }

  employees = employees.filter(emp => emp.id !== parseInt(id));
  return res.status(200).json({ message: "Employee deleted successfully" });
}

/**
 * Convert seconds to "min sec" format
 */
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min} min ${sec} sec`;
}

/**
 * Convert "min sec" format to total seconds
 */
function parseTimeToSeconds(timeString) {
  const [min, sec] = timeString.split(" ").map((val, i) => (i % 2 === 0 ? parseInt(val) || 0 : 0));
  return min * 60 + sec;
}

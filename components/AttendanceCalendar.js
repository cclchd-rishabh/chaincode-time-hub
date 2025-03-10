import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDatewiseAttendance } from "/pages/api/fetch";

export default function AttendanceCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceData(selectedDate);
    }
  }, [selectedDate]);

  const fetchAttendanceData = async (date) => {
    setLoading(true);
    setError(null);
    
    try {
        const dateString = date.toISOString().split('T')[0];
        console.log("Fetching attendance for date:", dateString); // For debugging
        
      const data = await getDatewiseAttendance(dateString);
      console.log("Attendance data:", data);
      setAttendanceData(data);
    } catch (error) {
      setError("Failed to fetch attendance data.");
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Select Date for Attendance</h2>
      
      {/* Date Picker */}
      <div className="mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          className="p-2 border rounded-lg"
        />
      </div>

      {/* Loading / Error */}
      {loading && <p className="text-blue-500">Loading attendance...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Attendance Table */}
      {!loading && attendanceData.length > 0 && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Employee</th>
              <th className="border p-2">Clock In</th>
              <th className="border p-2">Clock Out</th>
              <th className="border p-2">Break Time</th>
              <th className="border p-2">Work Time</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((employee) => (
              <tr key={employee.employee_id} className="text-center">
                <td className="border p-2">
                  <div className="flex items-center gap-2">
                    <img 
                      src={employee.avatar || "/default-avatar.png"} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <span>{employee.first_name} {employee.last_name}</span>
                  </div>
                </td>
                <td className="border p-2">{employee.clock_in || "N/A"}</td>
                <td className="border p-2">{employee.clock_out || "N/A"}</td>
                <td className="border p-2">{employee.total_break_time || "N/A"}</td>
                <td className="border p-2">{employee.total_work_time || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && attendanceData.length === 0 && !error && (
        <p className="text-gray-500">No attendance records found for this date.</p>
      )}
    </div>
  );
}
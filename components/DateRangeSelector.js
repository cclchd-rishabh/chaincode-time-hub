import { useState } from "react";
import { DateRangeAttendance } from '/pages/api/fetch';
import ExcelJS from 'exceljs';
import { FaCalendar, FaChevronDown, FaTimes, FaDownload, FaSpinner } from 'react-icons/fa';
import { saveAs } from 'file-saver'; // Import saveAs function

const DateRangeSelector = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  function formatTimeWithAMPM(timestamp) {
    if (!timestamp) return "N/A";
    // If less than 13 digits, it's likely in seconds and needs to be multiplied by 1000
    const timeInMs = timestamp.toString().length < 13 ? timestamp * 1000 : timestamp;

    return new Date(timeInMs).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function formatStopwatchTime(seconds) {
    if (!seconds) return "00:00:00";

    // If it's already in HH:MM:SS format
    if (typeof seconds === 'string' && seconds.includes(':')) {
      const [hours, minutes, secs] = seconds.split(":").map(Number);
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    // Convert to number if it's not already
    const totalSeconds = Number(seconds);

    // Calculate hours, minutes, seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);

    // Format as HH:MM:SS
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  const handleExportDateRange = async () => {
    setIsExporting(true);
    console.log(startDate, "Start-date", "End-date", endDate);
    await exportDateRangeToExcel(startDate, endDate);
    setIsExporting(false);
  };

  const exportDateRangeToExcel = async (startDate, endDate) => {
    try {
      // Fetch data for the selected date range
      const data = await DateRangeAttendance(startDate, endDate);
      console.log("data -> ", data);
      if (!data || data.length === 0) {
        alert("No attendance data available for the selected date range.");
        return;
      }
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Date Range Attendance Report");
      
      // Add formatted date range to the report title
      const startDateFormatted = startDate.toLocaleDateString();
      const endDateFormatted = endDate.toLocaleDateString();
      
      // Add report header
      worksheet.mergeCells('A1:L1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `Attendance Report: ${startDateFormatted} to ${endDateFormatted}`;
      titleCell.font = { size: 14, bold: true };
      titleCell.alignment = { horizontal: 'center' };
      
      // Add some space after the title
      worksheet.addRow([]);
      
      // Group data by employee and by date
      const employeeMap = {};
      const allDates = new Set();
      
      // First, organize data by employee and collect all unique dates
      data.forEach(record => {
        // Extract date from timestamp or use the date string
        const dateStr = record.clock_in 
          ? new Date(record.clock_in * 1000).toISOString().split('T')[0] 
          : record.attendance_date || "N/A";
        
        allDates.add(dateStr);
        
        if (!employeeMap[record.employee_id]) {
          employeeMap[record.employee_id] = {
            employee_id: record.employee_id,
            employee_name: `${record.first_name} ${record.last_name}`,
            department: record.department,
            role: record.role,
            dates: {}
          };
        }
        
        employeeMap[record.employee_id].dates[dateStr] = {
          clock_in: record.clock_in ? formatTimeWithAMPM(record.clock_in) : "On Leave",
          clock_out: record.clock_out ? formatTimeWithAMPM(record.clock_out) : "On Leave",
          idle_hours: formatStopwatchTime(record.total_break_time),
          active_hours: formatStopwatchTime(record.total_work_time),
          total_hours: formatStopwatchTime(record.total_time),
          status: record.attendance_status || "On Leave",
          // Store raw values for totals calculation
          raw_idle_hours: record.total_break_time || 0,
          raw_active_hours: record.total_work_time || 0,
          raw_total_hours: record.total_time || 0
        };
      });
      
      // Convert dates to sorted array
      const sortedDates = Array.from(allDates).sort();
      
      // Define the fixed employee info columns
      const fixedColumns = [
        { header: "Employee ID", key: "employee_id", width: 12 },
        { header: "Name", key: "employee_name", width: 25 },
        { header: "Department", key: "department", width: 20 },
        { header: "Role", key: "role", width: 25 }
      ];
      
      // Create dynamic columns for each date
      let allColumns = [...fixedColumns];
      let colIndex = fixedColumns.length + 1; // Starting column index after fixed columns
      
      // Map to keep track of column indices for totals calculation
      const dateColumnMap = {};
      
      // For each date, add the 6 attendance columns
      sortedDates.forEach(date => {
        const formattedDate = new Date(date).toLocaleDateString();
        dateColumnMap[date] = {
          startCol: colIndex,
          // Add merged header for the date
          dateHeader: {
            col: colIndex,
            span: 6 // 6 columns per date
          }
        };
        
        allColumns.push({ header: "Clock In", key: `${date}_clock_in`, width: 15 });
        allColumns.push({ header: "Clock Out", key: `${date}_clock_out`, width: 15 });
        allColumns.push({ header: "Idle Hours", key: `${date}_idle_hours`, width: 15 });
        allColumns.push({ header: "Active Hours", key: `${date}_active_hours`, width: 15 });
        allColumns.push({ header: "Total Hours", key: `${date}_total_hours`, width: 15 });
        allColumns.push({ header: "Status", key: `${date}_status`, width: 15 });
        
        colIndex += 6;
      });
      
      // Add totals columns
      const totalsStartCol = colIndex;
      allColumns.push({ header: "Total Idle Hours", key: "total_idle_hours", width: 15 });
      allColumns.push({ header: "Total Active Hours", key: "total_active_hours", width: 15 });
      allColumns.push({ header: "Total Hours", key: "total_hours", width: 15 });
      
      // Set columns in worksheet
      worksheet.columns = allColumns;
      
      // Add date headers (row 3)
      const dateHeaderRow = worksheet.getRow(3);
      sortedDates.forEach(date => {
        const formattedDate = new Date(date).toLocaleDateString();
        const { dateHeader } = dateColumnMap[date];
        
        // Merge the date header cells
        const startCell = dateHeaderRow.getCell(dateHeader.col);
        worksheet.mergeCells(3, dateHeader.col, 3, dateHeader.col + dateHeader.span - 1);
        startCell.value = formattedDate;
        startCell.font = { bold: true };
        startCell.alignment = { horizontal: 'center' };
        startCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD6EAF8' } // Light blue for date headers
        };
      });
      
      // Add "Totals" header for the totals columns
      const totalsHeaderCell = worksheet.getCell(3, totalsStartCol);
      worksheet.mergeCells(3, totalsStartCol, 3, totalsStartCol + 2);
      totalsHeaderCell.value = "Totals";
      totalsHeaderCell.font = { bold: true };
      totalsHeaderCell.alignment = { horizontal: 'center' };
      totalsHeaderCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' } // Gray for totals header
      };
      
      // Add column sub-headers (row 4)
      const subHeaderRow = worksheet.getRow(4);
      allColumns.forEach((col, index) => {
        const cell = subHeaderRow.getCell(index + 1);
        cell.value = col.header;
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      });
      
      // Start adding data from row 5
      let rowIndex = 5;
      
      // Convert employees to array and sort by ID or name
      const employees = Object.values(employeeMap).sort((a, b) => a.employee_id.toString().localeCompare(b.employee_id.toString()));
      
      // Add employee rows
      employees.forEach(employee => {
        const rowData = {
          employee_id: employee.employee_id,
          employee_name: employee.employee_name,
          department: employee.department,
          role: employee.role
        };
        
        // Track totals for this employee
        let totalIdleHours = 0;
        let totalActiveHours = 0;
        let totalHours = 0;
        
        // Add data for each date
        sortedDates.forEach(date => {
          const attendanceData = employee.dates[date] || {
            clock_in: "N/A",
            clock_out: "N/A",
            idle_hours: "00:00:00",
            active_hours: "00:00:00",
            total_hours: "00:00:00",
            status: "Absent",
            raw_idle_hours: 0,
            raw_active_hours: 0,
            raw_total_hours: 0
          };
          
          // Add to row data
          rowData[`${date}_clock_in`] = attendanceData.clock_in;
          rowData[`${date}_clock_out`] = attendanceData.clock_out;
          rowData[`${date}_idle_hours`] = attendanceData.idle_hours;
          rowData[`${date}_active_hours`] = attendanceData.active_hours;
          rowData[`${date}_total_hours`] = attendanceData.total_hours;
          rowData[`${date}_status`] = attendanceData.status;
          
          // Add to totals
          totalIdleHours += attendanceData.raw_idle_hours;
          totalActiveHours += attendanceData.raw_active_hours;
          totalHours += attendanceData.raw_total_hours;
        });
        
        // Add totals to row data
        rowData.total_idle_hours = formatStopwatchTime(totalIdleHours);
        rowData.total_active_hours = formatStopwatchTime(totalActiveHours);
        rowData.total_hours = formatStopwatchTime(totalHours);
        
        // Add the row to worksheet
        const row = worksheet.addRow(rowData);
        
        // Apply conditional formatting for status cells
        sortedDates.forEach(date => {
          const statusColIndex = dateColumnMap[date].startCol + 5; // Status is the 6th column for each date
          const statusCell = row.getCell(statusColIndex);
          
          if (statusCell.value === 'active') {
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFD4EDDA' } // Light green
            };
          } else if (statusCell.value === 'on_break') {
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFF3CD' } // Light yellow
            };
          } else if (statusCell.value === 'On Leave' || statusCell.value === 'Absent') {
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8D7DA' } // Light red
            };
          }
        });
        
        rowIndex++;
      });
      
      // Add a company summary row with grand totals
      const summaryRowIndex = rowIndex + 1;
      const summaryRow = worksheet.addRow();
      summaryRow.getCell(1).value = "COMPANY TOTALS:";
      worksheet.mergeCells(summaryRowIndex, 1, summaryRowIndex, fixedColumns.length);
      summaryRow.getCell(1).font = { bold: true, size: 12 };
      summaryRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      // Calculate and add grand totals
      let grandTotalIdleHours = 0;
      let grandTotalActiveHours = 0;
      let grandTotalHours = 0;
      
      employees.forEach(employee => {
        sortedDates.forEach(date => {
          const attendanceData = employee.dates[date] || { raw_idle_hours: 0, raw_active_hours: 0, raw_total_hours: 0 };
          grandTotalIdleHours += attendanceData.raw_idle_hours;
          grandTotalActiveHours += attendanceData.raw_active_hours;
          grandTotalHours += attendanceData.raw_total_hours;
        });
      });
      
      // Set the grand total values
      summaryRow.getCell(totalsStartCol).value = formatStopwatchTime(grandTotalIdleHours);
      summaryRow.getCell(totalsStartCol + 1).value = formatStopwatchTime(grandTotalActiveHours);
      summaryRow.getCell(totalsStartCol + 2).value = formatStopwatchTime(grandTotalHours);
      
      // Format the totals cells
      for (let i = 0; i < 3; i++) {
        const cell = summaryRow.getCell(totalsStartCol + i);
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      }
      
      // Auto-filter for all data
      worksheet.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: rowIndex - 1, column: allColumns.length }
      };
      
      // Freeze panes for better navigation
      worksheet.views = [
        { state: 'frozen', xSplit: fixedColumns.length, ySplit: 4, activeCell: 'A5' }
      ];
      
      // Protect worksheet
      worksheet.protect("teamice123", {
        selectLockedCells: true,
        formatCells: false,
        insertRows: false,
        deleteRows: false,
        editObjects: false
      });
      
      // Save and download the workbook
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, `Attendance_Report_${startDateFormatted}_to_${endDateFormatted}.xlsx`);
      
    } catch (error) {
      console.error("Error exporting attendance:", error);
      alert("An error occurred while exporting the report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 border border-blue-600 text-blue-600 rounded-md px-3 py-2 hover:bg-blue-50 transition-all focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaCalendar size={16} />
        <span>Date Range Export</span>
        <FaChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Export Date Range</h3>
            <button 
              className="text-gray-400 hover:text-gray-600" 
              onClick={() => setIsOpen(false)}
            >
              <FaTimes size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-col">
              <label htmlFor="start-date" className="text-xs text-gray-500 mb-1">Start Date:</label>
              <input
                type="date"
                id="start-date"
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="end-date" className="text-xs text-gray-500 mb-1">End Date:</label>
              <input
                type="date"
                id="end-date"
                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 w-full text-sm"
                value={endDate.toISOString().split('T')[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                min={startDate.toISOString().split('T')[0]}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <button 
              className={`w-full flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isExporting 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={handleExportDateRange}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <FaSpinner size={14} className="animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FaDownload size={14} />
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
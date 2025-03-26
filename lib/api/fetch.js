import toast from "react-hot-toast";
import sendRequest from './send-request'
const BASE_PATH = '/employees'
const getRootUrl = "http://localhost:4000";
export async function getAllEmployees(req,res){
  console.log("getAllEmployees");
  return sendRequest(`${BASE_PATH}`, {
    method: 'GET',
})
}

export async function createEmployee(formData) {
  console.log("createEmployee ->", formData);
  try {
    const token = sessionStorage.getItem('token');
    const response = await fetch(`${getRootUrl}${BASE_PATH}`, {
      method: "POST",
      credentials: 'same-origin',
      headers: {
        // Don't set Content-Type for FormData requests
        // Let the browser handle it automatically
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Send FormData directly
    });

    const data = await response.json();
    
    if (response.status === 403) {
      toast.error("You are not authorized to perform this task");
    } else if (response.status === 401) {
      toast.error("Invalid Credentials");
    } else if (data.success) {
      toast.success("Employee Boarded");
    } else {
      toast.error("Email Already Exists");
    }
    
    console.log("data->", data);
    return data;
  } catch (error) {
    console.error("Error in createEmployee:", error);
    toast.error("Failed to create employee");
    throw new Error("Failed to create employee");
  }
}

export async function deleteEmployee(id){
  console.log("deleteEmployee" , id);
  return sendRequest(`${BASE_PATH}/${id}`,{
    method: 'DELETE'
  })
}

export async function editEmployees(id, formData) {
  try {
      console.log("Editing employee", id);
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${getRootUrl}${BASE_PATH}/${id}`, {
          method: "PUT",
          credentials: "same-origin",
          headers: {
              Authorization: `Bearer ${token}`,
          },
          body: formData,
      });

      if (!response.ok) {
          console.error(`Error: ${response.status} - ${response.statusText}`);
          return null;
      }

      const data = await response.json();
      return data;
  } catch (err) {
      console.error("Error editing employee in fetch:", err);
      return null;
  }

}

export async function empClockedIn(id){
  try{
    console.log("console of empClockedIn",id);
    console.log("Clocking in ", id);
    return sendRequest(`${BASE_PATH}/clock-in/${id}`,{
      method:'POST'
    })
  }catch(e){
    console.error(e);
  }
}

export async function empClockedOut(id){
  try{
    console.log("Clocking out ", id);
    return sendRequest(`${BASE_PATH}/clock-out/${id}`,{
      method:'PUT'
    })
  }catch(e){
    console.error(e);
  }
}

export async function empBreakStart(id){
  try{
    console.log("Starting break for employee ", id);
    return sendRequest(`${BASE_PATH}/break-start/${id}`,{
      method:'PUT'
    })
  }catch(e){
    console.error(e);
  }
}
export async function empBreakEnd(id){
  try{
    console.log("Ending break for employee ", id);
    return sendRequest(`${BASE_PATH}/break-end/${id}`,{
      method:'PUT'
    })
  }catch(e){
    console.log(e);
  }
}

export async function getDatewiseAttendance(date) {
  try {
    const token = sessionStorage.getItem('token'); // Ensure the token is stored correctly
    console.log("Token:", token);

    if (!token) {
      toast.error("Not Authorized");
      console.error("No token found in sessionStorage!");
      return null;
    }

    return await sendRequest(`${BASE_PATH}/daily-attendance?date=${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  
        'Content-Type': 'application/json',
      },
    });
  } catch (e) {
    console.error("Error fetching attendance:", e);
    return null;
  }
}
  export async function DateRangeAttendance(startDate,endDate){
    try{
      console.log("Date range fetch req sent");
      const token = sessionStorage.getItem('token')
        console.log("Token:",token);
        if(!token){
          toast.error("Not Authorized");
          console.error("No token found in session Storage");
          return null ;
        }
        return await sendRequest(`${BASE_PATH}/daterange?start=${startDate}&end=${endDate}`,{
          method : 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,  
            'Content-Type': 'application/json',
          },
        });
      
    }catch(e){
      console.error("Error in fetching employees range wise report");
      return null
    }
  }



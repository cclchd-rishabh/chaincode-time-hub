import toast from "react-hot-toast";
import sendRequest from './send-request'
const BASE_PATH = '/employees'
// const getRootUrl = "http://localhost:4000";
const getRootUrl = "https://timehub-api.chaincodeconsulting.com/";

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
  
  
  
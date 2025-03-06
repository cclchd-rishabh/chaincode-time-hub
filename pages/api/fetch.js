
import sendRequest from './send-request'
const BASE_PATH = '/employees'

export async function getAllEmployees(req,res){
  console.log("getAllEmployees");
  return sendRequest(`${BASE_PATH}`, {
    method: 'GET',
})
}

export async function createEmployee(values) {
  console.log("createEmployee ->", values);
  try {
      const data = await sendRequest(`${BASE_PATH}`, {
          method: "POST",
          body: JSON.stringify(values),
      });
      console.log("data->",data);
      return data;
  } catch (error) {
      console.error("Error in createEmployee:", error);
      throw new Error("Failed to create employee");
  }
}

export async function deleteEmployee(id){
  console.log("deleteEmployee" , id);
  return sendRequest(`${BASE_PATH}/${id}`,{
    method: 'DELETE'
  })
}

export async function editEmployees(id,values){
  try{
    console.log("Editing Employee data -> " , values);
    return sendRequest(`${BASE_PATH}/${id}`,{
      method: 'PUT',
      body: JSON.stringify(values)
    })
   
  }catch(err){
    console.error("Error editing employee in fetch");
  }
}



export async function empClockedIn(id){
  try{
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





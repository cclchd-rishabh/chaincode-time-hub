import toast from "react-hot-toast";
import sendRequest from './send-request'
const BASE_PATH = '/auth'


export async function loginUser(formData){
    console.log("Login request is sent from frontend -> ", formData) ;
    return sendRequest (`${BASE_PATH}/login`,{
        method:'POST',
        body: JSON.stringify(formData)
    })
}

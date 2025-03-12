import 'isomorphic-unfetch'
import toast from "react-hot-toast";
// import { getRootUrl, getMVSUrl } from './getRootUrl'
// const axios = require('axios')
 
const getRootUrl = "http://localhost:4000"
// const getCookie = (name) => {
//     const value = `; ${document.cookie}`
//     const parts = value.split(`; ${name}=`)
//     if (parts.length === 2) return parts.pop().split(';').shift()
//     return true
// }
 console.log("Inside");
export default async function sendRequest(path, opts = {}) {
    const token = sessionStorage.getItem('token'); // Ensure the token is stored correctly
    console.log("Token:", token);

    console.log("Here-also");
    console.log(`Link -> ${getRootUrl}${path}`);
    // const authToken = getCookie('authToken')
    // if (token==null) {
    //     console.log("Token not found");
    //     throw new Error('Auth token not found')
    // }

    const headers = Object.assign({}, opts.headers || {}, {
        'Content-type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${token}`,
    })
        // const response = await fetch('http://localhost:4000/employees');
    
        const response = await fetch(
            `${getRootUrl}${path}`,
            Object.assign({ method: 'POST', credentials: 'same-origin' }, opts, {
                headers,
            }),
        )
    const data = await response.json()
        

    
    if (response.status == 403) {
        toast.error("You are not authorized to perform this task");
    }
    if(response.status == 401){
        toast.error("Incorrect Username / Password");
    }
    
    console.log(data);
    return data

}
import 'isomorphic-unfetch'
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
    console.log("Here-also");
    console.log(`Link -> ${getRootUrl}${path}`);
    // const authToken = getCookie('authToken')
    // if (!authToken) {
    //     throw new Error('Auth token not found')
    // }

    const headers = Object.assign({}, opts.headers || {}, {
        'Content-type': 'application/json; charset=UTF-8',
        // Authorization: `Bearer ${authToken}`,
    })
 

        // const response = await fetch('http://localhost:4000/employees');
       try{

       
        const response = await fetch(
            `${getRootUrl}${path}`,
            Object.assign({ method: 'POST', credentials: 'same-origin' }, opts, {
                headers,
            }),
        )
        const data = await response.json()
        // console.log(data);
        return data
    }catch(e){
        console.error("Error from sendRequest ",e);
    }
        
    // if (response.status !== 201) {
    //     throw response
    // }
 

}
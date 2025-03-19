import 'isomorphic-unfetch';
import toast from "react-hot-toast";
const getRootUrl = "http://localhost:4000";

console.log("Inside");

export default async function sendRequest(path, opts = {}, router) {
    
    const token = sessionStorage.getItem('token'); 
    console.log("Token:", token);

    console.log("Here-also");
    console.log(`Link -> ${getRootUrl}${path}`);

    const headers = Object.assign({}, opts.headers || {}, {
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${token}`,
    });

    const response = await fetch(
        `${getRootUrl}${path}`,
        Object.assign({ method: 'POST', credentials: 'same-origin' }, opts, {
            headers,
        })
    );

    const data = await response.json();

    if (response.status === 403) {
        toast.error("You are not authorized to perform this task");
    }
    if (response.status === 401) {
        toast.error("Invalid Credentials");

    }

    console.log(data);
    return data;
}

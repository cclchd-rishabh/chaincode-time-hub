import 'isomorphic-unfetch';
import toast from "react-hot-toast";

// const getRootUrl = "http://localhost:3008";
const getRootUrl = "https://timehub-api.chaincodeconsulting.com";

export default async function sendRequest(path, opts = {}, router) {
    try {
        const token = sessionStorage.getItem('token');
        if (!token && !path.includes('/login')) {
            console.warn("No token found, user might be logged out.");
            toast.error("Authentication token missing. Please log in.");
            return;
        }

        console.log("Token:", token);

        const headers = {
            'Content-Type': 'application/json; charset=UTF-8',
            ...(opts.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };

        const requestOptions = {
            method: opts.method || 'POST',
            credentials: 'include',  // Ensure credentials are always included
            mode: 'cors',
            headers,
            ...opts
        };

        if (!opts.body) {
            delete requestOptions.body;
        }

        const url = `${getRootUrl}${path}`;
        console.log(`Request URL: ${url}`);
        console.log('Request Options:', requestOptions);

        const response = await fetch(url, requestOptions);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (parseError) {
                errorData = { message: `HTTP error! status: ${response.status}` };
            }

            const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;

            switch (response.status) {
                case 400:
                    toast.error(`Bad Request: ${errorMessage}`);
                    break;
                case 401:
                    toast.error("Unauthorized. Please log in again.");
                    if (router) {
                        sessionStorage.clear();
                        router.push('/login');
                    }
                    break;
                case 403:
                    toast.error("Forbidden: You don't have permission.");
                    break;
                case 404:
                    toast.error("Resource not found.");
                    break;
                case 500:
                    toast.error("Server error. Please try again later.");
                    break;
                default:
                    toast.error(errorMessage);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Response from send-request:", data);
        return data;

    } catch (error) {
        console.error('Request Error:', error);
        toast.error(error.message || 'An unexpected error occurred');
        throw error;
    }
}

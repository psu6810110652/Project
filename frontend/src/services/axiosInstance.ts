import axios from 'axios';
import { NavigateFunction } from 'react-router-dom';

// Create a configured Axios instance
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000', // Adjust if you have a different backend URL
});

// 1. Request Interceptor: Pass token in Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        // Automatically attach token to every outgoing request
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Response Interceptor: Handle 401 & 403 globally
// Note: Since React Router hooks (like useNavigate) cannot be used directly outside of React components,
// we export a setup function that can take the `navigate` function from your React app, 
// or alternatively, we fallback to window.location if not injected.
export const setupAxiosInterceptors = (navigate?: NavigateFunction) => {
    axiosInstance.interceptors.response.use(
        (response) => {
            // Return response if successful
            return response;
        },
        (error) => {
            // Check if the backend returned a 401 Unauthorized or 403 Forbidden
            if (error.response && [401, 403].includes(error.response.status)) {
                console.warn('Unauthorized or Forbidden access. Clearing user session...');

                // Automatically clear local storage
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Redirect the user to the /login page
                if (navigate) {
                    navigate('/login', { replace: true });
                } else {
                    // Fallback if navigate is not provided
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );
};

// Auto-run basic interceptor setup logic without navigate injection just in case
setupAxiosInterceptors();

export default axiosInstance;

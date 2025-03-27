import { useState } from 'react';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {loginUser} from '/lib/api/auth';
import {useRouter} from 'next/router'
import { useDispatch } from "react-redux";
import { login } from "../store/slices/AuthSlice";
import toast from 'react-hot-toast';

export default function LoginPage() {
    const dispatch = useDispatch();
    const Router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
   
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [errors, setErrors] = useState({
        username: '',
        password: ''
    });

    const validateForm = () => {
        let tempErrors = { username: '', password: '' };
        let formIsValid = true;

        // Username validation
        if (!formData.username.trim()) {
            tempErrors.username = 'Username is required';
            formIsValid = false;
        } else if (formData.username.length < 3) {
            tempErrors.username = 'Username must be at least 3 characters long';
            formIsValid = false;
        }

        // Password validation
        if (!formData.password.trim()) {
            tempErrors.password = 'Password is required';
            formIsValid = false;
        } else if (formData.password.length < 6) {
            tempErrors.password = 'Password must be at least 6 characters long';
            formIsValid = false;
        }

        setErrors(tempErrors);
        return formIsValid;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear the specific error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            toast.error('Please correct the errors in the form');
            return;
        }

        try {
            const res = await loginUser(formData);
            
            if (!res || !res.access_token) {
                toast.error("No access token received");
                return;
            }
    
            const { access_token, role } = res;
            sessionStorage.setItem('token', access_token);
            sessionStorage.setItem('role', role);
            
            dispatch(login(access_token, role));
            toast.success('Login Successful!');
            Router.push('/manage-emp');
        } catch (error) {
            toast.error(error.message || "Login failed");
            console.error("Login failed:", error.message || error);
        }
    };
    

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left side with illustration */}
            <div className="hidden lg:flex lg:w-1/2 bg-white relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gray-100 rounded-t-full transform translate-y-1/4"></div>

                {/* 3D character */}
                <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center">
                    <Image
                        src="/avatar1.jpg"
                        alt="3D Character"
                        layout="fill"
                        objectFit="contain"
                        priority
                        className='transform scale-125'
                    />
                </div>
            </div>

            {/* Right side with login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chaincode Consulting 👋</h1>
                    <p className="text-gray-600 mb-8">Please sign-in to your account</p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="username" className="block text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                                    ${errors.username 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 focus:ring-indigo-500'
                                    }`}
                                placeholder="username"
                                required
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between mb-2">
                                <label htmlFor="password" className="block text-gray-700">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
                                        ${errors.password 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-300 focus:ring-indigo-500'
                                        }`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>
                    
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition duration-300"
                        >
                            Sign in
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
import { useState } from 'react';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {loginUser} from '/pages/api/auth';
import {useRouter} from 'next/router'
import { useDispatch } from "react-redux";
import { login } from "../store/slices/AuthSlice";


export default function LoginPage() {
    const dispatch = useDispatch();
    const Router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
   
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await loginUser(formData);
            
            if (!res || !res.access_token) {
                console.error("No access token received");
                return;
            }
    
            const { access_token,role} = res;
            console.log("login resp from backend ->" , res);
            sessionStorage.setItem('token', access_token);
            sessionStorage.setItem('role',role)
            console.log("Access Token:", access_token);
            dispatch(login(access_token,role));
          
            Router.push('/manage-emp');
        } catch (error) {
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
                    {/* Logo for mobile view */}
                   

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Chaincode Consulting 👋</h1>
                    <p className="text-gray-600 mb-8">Please sign-in to your account</p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 mb-2">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="username"
                                required
                            />
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            
                        </div>
                    
                        <button
                        onClick={handleSubmit}
                            type="submit"
                            className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition duration-300"
                        >
                            Sign in
                        </button>
                       
                    </form>

                    <div className="mt-6 text-center">
 
                    </div>

                  
                   
                </div>
            </div>
        </div>
    );
}
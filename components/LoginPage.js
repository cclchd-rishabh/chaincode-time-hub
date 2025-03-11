import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaEye, FaEyeSlash, FaFacebookF } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import {loginUser} from '/pages/api/auth';
import {useRouter} from 'next/router'
import { useAuth } from './context/AuthContext'; 


export default function LoginPage() {
    // const navigate = useNavigate();
    const Router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const {isAuthenticated,login} = useAuth();
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
    
            const { access_token } = res;
    
            sessionStorage.setItem('token', access_token);
            console.log("Access Token:", access_token);
            login(access_token);
          
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
                {/* Stats cards */}
                {/* <div className="absolute left-1/4 top-1/3">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-40">
                        <div className="text-sm text-gray-500">Profit</div>
                        <div className="text-sm text-gray-400">Last Month</div>
                        <div className="flex items-center mt-2">
                            <Image
                                src="/profit-chart.svg"
                                alt="Profit Chart"
                                width={100}
                                height={40}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="font-bold">624k</div>
                            <div className="text-green-500 text-sm">+8.24%</div>
                        </div>
                    </div>
                </div> */}

                {/* <div className="absolute right-1/4 top-1/2">
                    <div className="bg-white p-4 rounded-lg shadow-lg w-40">
                        <div className="text-sm text-gray-500">Order</div>
                        <div className="text-sm text-gray-400">Last week</div>
                        <div className="flex items-center justify-center mt-2">
                            <Image
                                src="/order-chart.svg"
                                alt="Order Chart"
                                width={100}
                                height={40}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <div className="font-bold">124k</div>
                            <div className="text-green-500 text-sm">+12.6%</div>
                        </div>
                    </div>
                </div> */}

                {/* Logo */}
                {/* <div className="absolute top-8 left-8">
                    <div className="flex items-center">
                        <div className="bg-indigo-500 w-8 h-8 rounded flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                                <path
                                    fill="currentColor"
                                    d="M12,10L8,14H11V20H13V14H16M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H9V18H5V8H19V18H15V20H19A2,2 0 0,0 21,18V6C21,4.89 20.11,4 19,4Z"
                                />
                            </svg>
                        </div>
                        <span className="ml-2 text-xl font-bold text-gray-800">Vuexy</span>
                    </div>
                </div> */}
            </div>

            {/* Right side with login form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo for mobile view */}
                    <div className="lg:hidden mb-8 flex items-center">
                        <div className="bg-indigo-500 w-8 h-8 rounded flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                                <path
                                    fill="currentColor"
                                    d="M12,10L8,14H11V20H13V14H16M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H9V18H5V8H19V18H15V20H19A2,2 0 0,0 21,18V6C21,4.89 20.11,4 19,4Z"
                                />
                            </svg>
                        </div>
                        <span className="ml-2 text-xl font-bold text-gray-800">Vuexy</span>
                    </div>

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
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-gray-700">
                                    Remember Me
                                </label>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="text-indigo-600 hover:text-indigo-800"
                            >
                                Forgot Password?
                            </Link>
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
                        <p className="text-gray-600">
                            New on our platform?{' '}
                            <Link href="/register" className="text-indigo-600 hover:text-indigo-800">
                                Create an account
                            </Link>
                        </p>

                        <div className="mt-6">
                            <p className="text-gray-500 mb-4">or</p>
                            <div className="flex justify-center space-x-4">
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                                    <FaFacebookF className="text-blue-600" size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                                    <FaXTwitter size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                                    <FaGithub size={18} />
                                </button>
                                <button className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-50">
                                    <FcGoogle size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Buy Now button for mobile view */}
                   
                </div>
            </div>
        </div>
    );
}
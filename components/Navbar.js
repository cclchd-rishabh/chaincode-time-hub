import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { logout } from "../store/slices/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../store/slices/AuthSlice";
import Image from 'next/image';
import { useRef } from "react";

function Navbar() {
    const { isAuthenticated, role } = useSelector((state) => state.auth);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const [navHeight, setNavHeight] = useState(0);
    const navRef = useRef(null);

    useEffect(() => {
        dispatch(checkAuth());

        // Calculate navbar height and update on resize
        if (navRef.current) {
            setNavHeight(navRef.current.offsetHeight);

            const updateNavHeight = () => {
                if (navRef.current) {
                    setNavHeight(navRef.current.offsetHeight);
                }
            };

            window.addEventListener('resize', updateNavHeight);
            return () => window.removeEventListener('resize', updateNavHeight);
        }
    }, [dispatch, isAuthenticated, role]);

    function handleLogout() {
        dispatch(logout());
        router.push("/");
    }

    function closeMenu() {
        setIsOpen(false);
    }

    return (
        <>
            {/* Navbar */}
            <nav
                ref={navRef}
                className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-sm shadow-sm z-50 border-b border-gray-100"
            >
                <div className=" mx-auto px-6 py-3 flex justify-between items-center">

                    {/* Logo */}
                    <Link href="/" className="text-xl font-medium text-gray-800 flex items-center">
                        <Image
                            src="/logo.png"
                            alt="ChainCode Logo"
                            width={60}
                            height={60}
                            className="mr-2"
                        />
                        <span className="tracking-tight">ChainCode TimeHub</span>
                    </Link>

                    {/* Desktop Menu */}
                    {isAuthenticated && (
                        <ul className="hidden md:flex space-x-8 items-center">
                            <li>
                                <Link
                                    href="/manage-emp"
                                    className={`relative block px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 
        ${router.pathname === "/manage-emp" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"} 
        hover:shadow-md hover:bg-gray-100`}
                                >
                                    Manage Attendance
                                </Link>
                            </li>

                            {role === "HR" && (
                                <li>
                                    <Link
                                        href="/add-emp"
                                        className={`relative block px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 
            ${router.pathname === "/add-emp" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"} 
            hover:shadow-md hover:bg-gray-100`}
                                    >
                                        Manage Employees
                                    </Link>
                                </li>
                            )}


                            <li>
                                <button
                                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-200"
                                    onClick={handleLogout}
                                    aria-label="Logout"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-5 h-5 text-gray-700 hover:text-blue-600"
                                    >
                                       
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15m4.5-3h-9m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                
                                </button>
                            </li>
                        </ul>
                    )}

                    {/* Mobile Menu Button */}
                    <button className="md:hidden focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
                        <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isAuthenticated && isOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md animate-fadeIn">
                        <div className="container mx-auto py-3 px-6">
                            <ul className="space-y-4 py-2">
                                <li>
                                    <Link
                                        href="/manage-emp"
                                        className={`block py-2 text-gray-700 hover:text-blue-600 transition-all duration-200 ${router.pathname === "/manage-emp" ? "text-blue-600" : ""
                                            }`}
                                        onClick={closeMenu}
                                    >
                                         Manage Attendance
                                    </Link>
                                </li>

                                {role === "HR" && (
                                    <li>
                                        <Link
                                            href="/add-emp"
                                            className={`block py-2 text-gray-700 hover:text-blue-600 transition-all duration-200 ${router.pathname === "/add-emp" ? "text-blue-600" : ""
                                                }`}
                                            onClick={closeMenu}
                                        >
                                             Manage Employees
                                        </Link>
                                    </li>
                                )}

                                <li className="pt-2 border-t border-gray-100">
                                    <button
                                        className="w-full text-left py-2 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-all duration-200"
                                        onClick={() => { handleLogout(); closeMenu(); }}
                                        aria-label="Logout"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 004.5 21h9a2.25 2.25 0 002.25-2.25V15m4.5-3h-9m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer div to prevent content from being hidden under navbar */}
            <div style={{ height: `${navHeight}px` }} />
        </>
    );
}

export default Navbar;
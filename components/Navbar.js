import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { logout } from "../store/slices/AuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "../store/slices/AuthSlice";
function Navbar() {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(checkAuth());
      }, [dispatch]);

    function handleLogout() {
    
        dispatch(logout());
        router.push('/');
    }
    
    function closeMenu() {
        setIsOpen(false);
    }
    
    return (
        <nav className="bg-gray-200 shadow-md">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">      
                {isAuthenticated ?  (
                <Link href="/manage-emp" className="text-xl font-bold text-gray-700">
                    Chaincode Time Hub
                </Link>
                ) : (
                    <Link href="/" className="text-xl font-bold text-gray-700">
                    Chaincode Time Hub
                </Link>
                )} 
                <button 
                    className="md:hidden text-gray-700 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
                
                {isAuthenticated && (
                    <ul className="hidden md:flex space-x-6">
                        <li><Link href="/manage-emp" className="text-black hover:text-blue-600">Employee Management</Link></li>
                        <li><Link href="/add-emp" className="text-black hover:text-blue-600">Employee Module</Link></li>
                        <li><button className="text-black hover:text-blue-600" onClick={handleLogout}>
                            Logout
                        </button></li>
                    </ul>
                )}
            </div>
         
       
            {isAuthenticated && isOpen && (
                <ul className="md:hidden bg-gray-100 py-4 px-6 space-y-3">
                    <li><Link href="/manage-emp" className="block text-gray-700 hover:text-blue-600" onClick={closeMenu}>Employee Management</Link></li>
                    <li><Link href="/add-emp" className="block text-gray-700 hover:text-blue-600" onClick={closeMenu}>Employee Module</Link></li>
                    <li><button className="block text-gray-700 hover:text-blue-600" onClick={() => { handleLogout(); closeMenu(); }}>
                        Logout
                    </button></li>
                </ul>
            )}
        </nav>
    );
}

export default Navbar;
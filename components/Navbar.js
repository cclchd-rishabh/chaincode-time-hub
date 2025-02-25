import Link from 'next/link';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    function closeMenu() {
        setIsOpen(false);
    }
    return (
        <nav className="bg-gray-200 shadow-md">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">      
                <Link href="/" className="text-xl font-bold text-gray-700">
                 Chaincode Time Hub
                </Link>
                <button 
                    className="md:hidden text-gray-700 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>


                <ul className="hidden md:flex space-x-6">
                    <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
                    <li><Link href="/manage-emp" className="hover:text-blue-600">Work Time</Link></li>
                    <li><Link href="/add-emp" className="hover:text-blue-600">Employee Module</Link></li>
                </ul>
            </div>

       
            {isOpen && (
                <ul className="md:hidden bg-gray-100 py-4 px-6 space-y-3">
                    <li><Link href="/" className="block text-gray-700 hover:text-blue-600" onClick={closeMenu}>Home</Link></li>
                    <li><Link href="/m" className="block text-gray-700 hover:text-blue-600" onClick={closeMenu}>Work Time</Link></li>
                    <li><Link href="/add-emp" className="block text-gray-700 hover:text-blue-600" onClick={closeMenu}>Employee Module</Link></li>
                </ul>
            )}
        </nav>
    );
}

export default Navbar;

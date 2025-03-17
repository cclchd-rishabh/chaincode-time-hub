import Link from 'next/link';

function Footer() {
    return (
        <footer className="bg-gray-200 shadow-md py-6 mt-8">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-700 text-sm">&copy; {new Date().getFullYear()} Chaincode Time Hub. All rights reserved.</p>
                <ul className="flex space-x-6 mt-4 md:mt-0">

                </ul>
            </div>
        </footer>
    );
}

export default Footer;

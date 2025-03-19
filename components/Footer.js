function Footer() {
    return (
        <footer className="bg-white/90 backdrop-blur-sm shadow-sm border-t border-gray-100 py-6 mt-8">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                    <span className="text-blue-600 mr-2">○</span>
                    <span className="text-gray-800 font-medium tracking-tight">Chaincode Hub</span>
                </div>
                <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Chaincode Time Hub. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
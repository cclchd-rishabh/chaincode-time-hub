import React from 'react';
import Navbar from './Navbar';
import { useEffect } from 'react';
// import { AuthProvider } from './context/AuthContext'
import { useSelector } from "react-redux";
import Footer from "./Footer"
function Layout({ children }) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  return (
   
  
      <div>
        <Navbar />
        {children}
        <Footer />
      </div>
  );
}

export default Layout;
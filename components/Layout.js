import React from 'react';
import Navbar from './Navbar';
import { useEffect } from 'react';
// import { AuthProvider } from './context/AuthContext'
import { useSelector } from "react-redux";
function Layout({ children }) {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  return (
   
  
      <div>
        <Navbar />
        {children}
      </div>
  );
}

export default Layout;
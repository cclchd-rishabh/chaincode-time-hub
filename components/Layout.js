import React from 'react';
import Navbar from './Navbar';
// import { AuthProvider } from './context/AuthContext'

function Layout({ children }) {
  return (
  
      <div>
        <Navbar />
        {children}
      </div>
  );
}

export default Layout;
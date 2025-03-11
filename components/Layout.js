// components/Layout.js
import React from 'react';
import Navbar from './Navbar';
import { AuthProvider } from './context/AuthContext'

function Layout({ children }) {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        {children}
      </div>
    </AuthProvider>
  );
}

export default Layout;
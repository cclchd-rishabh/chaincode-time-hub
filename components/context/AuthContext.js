import React, { createContext, useState, useContext, useEffect } from 'react';


const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
 
useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("token");
      setIsAuthenticated(!!token);
    }
}, []);
  const login = (token) => {
    sessionStorage.setItem("token", token);
    setIsAuthenticated(true);
  };
  const logout = () => {
    sessionStorage.removeItem("token");
    
    setIsAuthenticated(false);
  };

  // The value that will be given to the context
  const value = {
    isAuthenticated,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
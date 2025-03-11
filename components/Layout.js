import Navbar from './Navbar';
import { useState ,useEffect} from 'react';
function Layout({ children }) {

  const [isAuthenticated,setIsAuthenticated]= useState(false);
    useEffect(()=>{
        if (typeof window !== "undefined") {
            const token = sessionStorage.getItem("token");
            setIsAuthenticated(!!token); 
        }
    },[isAuthenticated])

  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

export default Layout
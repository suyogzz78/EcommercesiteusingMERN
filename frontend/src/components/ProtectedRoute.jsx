import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  
  const userStr = localStorage.getItem('user');

  let storedData = null;
  let user = null;
  let token = null;
  
  try {
    storedData = userStr ? JSON.parse(userStr) : null;
   
    user = storedData?.user || storedData; 
    token = storedData?.token || localStorage.getItem('token'); 
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  console.log('ProtectedRoute Debug:', { storedData, user, token, adminOnly });

  if (!token) {
    console.log('No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }


  if (adminOnly) {
    console.log('Admin check - user.isAdmin:', user?.isAdmin);
    
    if (!user || !user.isAdmin) {
      console.log('User is not admin, redirecting to home');
      alert('Access denied. Admin only.');
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
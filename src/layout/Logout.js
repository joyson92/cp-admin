import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const logout = () => ({
    type: 'LOGOUT',
  });

  useEffect(() => {
    localStorage.removeItem('userName'); // Clear token from storage
    dispatch(logout()); // Dispatch Redux logout action
    navigate('/login'); // Redirect to login
  }, []);

  return <div>Logging out...</div>; // Optional loading indicator
};

export default Logout;

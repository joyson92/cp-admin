import React, { Suspense, useState } from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './scss/style.scss';

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);


// Lazy-loaded components
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));
const Login = React.lazy(() => import('./layout/Login'));
const Logout = React.lazy(() => import('./layout/Logout'));

function App() {

  const fetchCustomers = async () => {
    try {
       const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/customers?auto=0');
       if (!response.ok) {
          console.log('Failed to receive network response.');
       } else {
          const data = await response.json();
          const parsedData = JSON.parse(data.body);
          localStorage.setItem("cust", JSON.stringify(parsedData));
       }
    } catch (error) {
       console.error('Error fetching data:', error);
    }
  };

  const loggedInUser = useSelector(state => state.auth.loggedInUser);
  if(loggedInUser != null || loggedInUser != undefined){
    fetchCustomers();
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            {/* Loading indicator */}
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={loggedInUser ? <DefaultLayout /> : <Login />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

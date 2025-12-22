import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CCol,
  CRow,
  CAlert
} from '@coreui/react';

import CurrentOrders from './components/CurrentOrders';
import PastOrders from './components/PastOrders';
import Loader from './../Loader';
import API from '../../services/apiService';

// Main Component
const Orders = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const currentLocation = useLocation().pathname;
  const branch = useSelector((state) => state.auth.loggedInUser?.loc);
  const type = useSelector((state) => state.auth.loggedInUser?._t);

  useEffect(() => {
    setTableData([]);
    setLoading(true);
    const fetchData = async () => {
      try {
        let url = `/orders?loc=${branch}&t=${type}`;
        if (currentLocation === "/orders/pastOrders") {
            url = `/orders/pastOrders?loc=${branch}&t=${type}`;
        }
        const response = await API.get(url);
        if (response.status !== 200) {
          setAlertMsg({msg: 'Failed to fetch orders. Please contact administrator.', status: 'danger'});
          setShowAlert(true);
        }

        const parsedData = JSON.parse(response.data.data);
        setTableData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLocation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showAlert]);

  return (
  <CRow>
    <> {loading ? ( <Loader /> ): ''} </>
    <div className="alert-container">
        {showAlert && (
           <CAlert color={alertMsg.status} variant="solid">{alertMsg.msg}</CAlert>
          )}
        </div>
    <CCol xs={12}>
        {currentLocation === "/orders/pastOrders" ? (
            <PastOrders tableData = {tableData}/>
        ): (
            <CurrentOrders tableData = {tableData}/>
        )}
    </CCol>
  </CRow>

  );
};

export default Orders;

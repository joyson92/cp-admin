import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilArrowLeft } from '@coreui/icons';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CAlert,
  CFormInput,
  CAvatar
} from '@coreui/react';
import Loader from './../Loader';
import { format } from 'date-fns';
import API from '../../services/apiService';

import bot from './../../assets/images/avatars/bot.png';
import customer from './../../assets/images/avatars/customer.JPG';

// Main Component
const ViewEnquiry = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [loading, setLoading] = useState(true);

    useEffect(() => {
           const timer = setTimeout(() => {
             setShowAlert(false);
           }, 5000);

           return () => clearTimeout(timer);
        }, [showAlert]);

    const searchParams = new URLSearchParams(location.search);
    const dt = searchParams.get('dt');
    const cn = searchParams.get('cn');

    useEffect(() => {
          const fetchData = async () => {
            try {
              const response = await API.get(`/enquiries/viewenquiry?dt=${dt}&contact_number=${cn}`);
              if (response.status !== 200) {
                setLoading(false);
                setAlertMsg({msg: 'Failed to enquiry details. Please contact Administrator.', status: 'danger'});
                setShowAlert(true);
              } else {
                 const parsedData = JSON.parse(response.data.body);
                 setTableData(parsedData);
                 setLoading(false);
              }
            } catch (error) {
              console.error('Error fetching data:', error);
              setLoading(false);
            }
          };

          fetchData();
        }, []);

  return (
  <CRow>
   <> {loading ? ( <Loader /> ): ''} </>
  <div className="alert-container">
        {showAlert && (
          <CAlert color={alertMsg.status} variant="solid">{alertMsg.msg}</CAlert>
        )}
      </div>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
            <CIcon icon={cilArrowLeft} style={{cursor: 'pointer', marginRight: '10px', marginTop: '5px'}} title='Back' onClick={() => {navigate(-1)}}/>
              <strong>Customer Messages - {tableData.recip_id} {tableData.req_date}</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
        >
        {Array.isArray(tableData.msgs) && tableData.msgs.length > 0 ? (
        tableData.msgs.map((item, index) => (
          <div className={item.role == "user" ? "container": "container darker"}>
          <CAvatar src={item.role == "user" ? customer:bot} size="md" className={item.role == "user" ? "": "right"} />
            <CFormLabel htmlFor="customerNameId"><b>{item.role == "user" ? tableData.wa_p_name : "BOT"} : </b>{item.content}</CFormLabel>&nbsp;
            <span className={item.role == "user" ? "time-right": "time-left"}>{item.time}</span>
          </div>
          ))
        ): (
            <CFormLabel><b>Failed to load message</b></CFormLabel>
        )}

        </CForm>
        </CCardBody>
     </CCard>
  </CCol>
</CRow>
  );
};

export default ViewEnquiry;

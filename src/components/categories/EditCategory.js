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
  CFormInput,
  CButton,
  CFormSelect,
  CFormFeedback,
  CFormTextarea
} from '@coreui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import Loader from './../Loader';
import API from '../../services/apiService';
import AlertMessage from '../shared/AlertMessage';

// Main Component
const EditCategory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validated, setValidated] = useState(false);

  const handleSubmit = async(event) => {
      const form = event.currentTarget;
      event.preventDefault();
      if (form.checkValidity() === false) {
         event.stopPropagation()
         setValidated(true)
      } else {
          setSubmitState(true);
          setLoading(true);
          const formData = new FormData(event.target);
          formData.forEach((value, key) => {
            tableData[key] = value;
          });
          try {
            const response = await API.post('/categories/update', tableData);

            if (response.status !== 200) {
               setAlertMsg({msg: 'Failed to update due network issue.', status: 'danger'});
            } else {
               const parsedResp = JSON.parse(response.data.data);
               setAlertMsg({msg: parsedResp['message'], status: parsedResp['status']});
            }
            setShowAlert(true);
            setSubmitState(false);
            setLoading(false);
          } catch (error) {
            // Handle errors here
            console.error('There was an error with the POST request:', error);
            setLoading(false);
          }
      }
    }

    useEffect(() => {
           const timer = setTimeout(() => {
             setShowAlert(false);
           }, 5000); // Adjust the duration (in milliseconds) as needed

           return () => clearTimeout(timer); // Cleanup timer on component unmount
        }, [showAlert]);

    const handleStatusChange = (e) => {
      const { name, value } = e.target;
      setTableData({ ...tableData, [name]: value });
    };

    const searchParams = new URLSearchParams(location.search);

    useEffect(() => {
          const fetchData = async () => {
            try {
              const response = await API.get(`/categories/edit?id=${searchParams.get('id')}`);
              if (response.status !== 200) {
                 setAlertMsg({msg: 'Failed to fetch expenses. Please contact administrator.', status: 'danger'});
                 setShowAlert(true);
              } else {
                  const parsedData = JSON.parse(response.data.data);
                  setTableData(parsedData);
              }
              setLoading(false);
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
    <AlertMessage
          show={showAlert}
          setShow={setShowAlert}
          message={alertMsg.msg}
          status={alertMsg.status}
          duration={5000}
          redirectTo={alertMsg.redirect}
        />
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
            <CIcon icon={cilArrowLeft} style={{cursor: 'pointer', marginRight: '10px', marginTop: '5px'}} title='Back' onClick={() => {navigate(-1)}}/>
              <strong>Update Category</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <CCol md={4}>
            <CFormLabel htmlFor="amountId">Amount:</CFormLabel>
            <CFormInput type="text" name="amount" id="amountId" value={tableData.amount} onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter amount.</CFormFeedback>
          </CCol>

          <CCol xs={12} style={{textAlign: 'center'}}>
            <CButton color="danger" disabled={submitState} onClick={() => {navigate(-1)}} style={{marginRight: '10px'}}>
               Back
            </CButton>
            <CButton color="primary" type="submit" disabled={submitState}>
              Submit
            </CButton>
          </CCol>
        </CForm>
        </CCardBody>
     </CCard>
  </CCol>
</CRow>
  );
};

export default EditCategory;

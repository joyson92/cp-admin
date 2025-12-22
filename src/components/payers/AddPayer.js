import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CFormFeedback
} from '@coreui/react';
import Loader from './../Loader';
import API from '../../services/apiService';
import AlertMessage from '../shared/AlertMessage';

// Main Component
const AddPayer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ msg: '', status: 'success', redirect: '' });
  const [submitState, setSubmitState] = useState(false);
  const [validated, setValidated] = useState(false);

  const handleSubmit = async(event) => {
      const form = event.currentTarget;
      event.preventDefault();
      if (form.checkValidity() === false) {
         event.stopPropagation()
         setValidated(true)
      } else {
          setSubmitState(true);
          const formData = new FormData(event.target);
          const formObj = {};
          formData.forEach((value, key) => {
            formObj[key] = value;
          });
          try {
            const response = await API.post('/payers/add', formObj);

            if (response.status !== 200) {
               setAlertMsg({msg: 'Failed to customer details.', status: 'danger'});
               setShowAlert(true);
               setSubmitState(false);
               setLoading(false);
            } else {
               const parsedResp = JSON.parse(response.data.data);
               setLoading(false);
               setAlertMsg({msg: parsedResp['message'], status: 'success'});
               setShowAlert(true);
               setSubmitState(false);

            }
          } catch (error) {
            console.error('There was an error with the POST request:', error);
          }
    }
  }

    useEffect(() => {
           const timer = setTimeout(() => {
             setShowAlert(false);
           }, 5000); // Adjust the duration (in milliseconds) as needed

           return () => clearTimeout(timer); // Cleanup timer on component unmount
        }, [showAlert]);


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
              <strong>Add Payer Details</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <CCol md={4}>
            <CFormLabel htmlFor="payerNameId">Payer Name:</CFormLabel>
            <CFormInput type="text" name="payer_name" id="payerNameId" required/>
            <CFormFeedback invalid>Please enter payer name.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="contactNumberId">Contact Number:</CFormLabel>
            <CFormInput type="text" name="contact_number" id="contactNumberId" required/>
            <CFormFeedback invalid>Please enter contact number.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="bankAccountId">Bank Account Details:</CFormLabel>
            <CFormInput type="text" name="bank_account" id="bankAccountId"/>
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

export default AddPayer;

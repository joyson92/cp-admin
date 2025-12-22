import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { cilPen } from '@coreui/icons';
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
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CTableRow,
  CAlert,
  CFormFeedback
} from '@coreui/react';

// Main Component
const AddRider = () => {
  const [tableData, setTableData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [validated, setValidated] = useState(false)
  const [submitState, setSubmitState] = useState(false);

  const handleSubmit = async(event) => {
    const form = event.currentTarget
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
      setValidated(true)
    } else {
      event.preventDefault();
      setSubmitState(true);
      const formData = new FormData(event.target);
      const formObj = {};
      formData.forEach((value, key) => {
        formObj[key] = value;
      });
      try {
        const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/riders/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formObj)
        });

        if (!response.ok) {
          setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
          setShowAlert(true);
          setSubmitState(false);
          //throw new Error('Network response was not ok');
        } else {
          const resp = await response.json();
          const parsedResp = JSON.parse(resp.body);
          setAlertMsg({msg: parsedResp['message'], status: 'success'});
          setShowAlert(true);
          setSubmitState(false);
        }

      } catch (error) {
        // Handle errors here
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
    <div className="alert-container">
      {showAlert && (
        <CAlert color={alertMsg.status} variant="solid">{alertMsg.msg}</CAlert>
      )}
    </div>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Add Rider Details</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <CCol md={4}>
            <CFormLabel htmlFor="firstNameId">First Name</CFormLabel>
            <CFormInput type="text" name="firstNameId" id="firstNameId" required/>
            <CFormFeedback invalid>Please enter first name.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="lastNameId">Last Name</CFormLabel>
            <CFormInput type="text" name="lastNameId" id="lastNameId" required/>
            <CFormFeedback invalid>Please enter last name.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="phoneNumberId">Phone Number</CFormLabel>
            <CFormInput type="text" name="phoneNumberId" id="phoneNumberId" required/>
            <CFormFeedback invalid>Please enter phone number.</CFormFeedback>
          </CCol>
          <CCol md={4}>
             <CFormLabel htmlFor="altPhoneNumberId">Alternate Phone Number</CFormLabel>
             <CFormInput type="text" name="altPhoneNumberId" id="altPhoneNumberId" />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId">Address</CFormLabel>
            <CFormInput type="text" name="addressId" id="addressId" required/>
            <CFormFeedback invalid>Please enter address.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="emailId">Email Id</CFormLabel>
            <CFormInput type="text" name="emailId" id="emailId" />
          </CCol>

          <CCol xs={12}>
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

export default AddRider;

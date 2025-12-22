import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  CAlert,
  CFormFeedback
} from '@coreui/react';

// Main Component
const AddCompanyDetails = () => {
  const location = useLocation();
  const [tableData, setTableData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [validated, setValidated] = useState(false)
  const [submitState, setSubmitState] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const formObj = {};
  formObj['pickup_area'] = searchParams.get('id');
  useEffect(() => {
    const fetchData = async () => {
       try {
          const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/companydetails/fetchdetails',{
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify(formObj)
            });

          if (!response.ok) {
            setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
            setShowAlert(true);
          } else {
            const data = await response.json();
            const parsedData = JSON.parse(data.body);
            if (parsedData['message'] != 'undefined') {
              setTableData(parsedData);
            } else {
              setAlertMsg({msg: parsedData['message'], status: 'danger'});
              setShowAlert(true);
            }
          }


       } catch (error) {
          console.error('Error fetching data:', error);
       }
    };

    fetchData();
  }, []);

  const handleStatusChange = (e) => {
     const { name, value } = e.target;
     setTableData({ ...tableData, [name]: value });
  };

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
        const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/companydetails/add', {
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
        setSubmitState(false);
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
              <strong>Add Company Details</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <CCol md={4}>
            <CFormLabel htmlFor="pickUpAreaId">Pickup Area:</CFormLabel>
            <CFormInput type="text" name="pickUpArea" id="pickUpAreaId" value={tableData.pickUpArea} />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="pickUpAddressId">Pickup Address:</CFormLabel>
            <CFormInput type="text" name="pickUpAddress" id="pickUpAddressId" value={tableData.pickUpAddress}
             onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter pick-up address.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="operationHeadId">Operation Head:</CFormLabel>
            <CFormInput type="text" name="operationHead" id="operationHeadId" value={tableData.operationHead}
            onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter operation head person name.</CFormFeedback>
          </CCol>
          <CCol md={4}>
             <CFormLabel htmlFor="operationHeadNumberId">Operation Head Number</CFormLabel>
             <CFormInput type="text" name="operationHeadNumber" id="operationHeadNumberId" value={tableData.operationHeadNumber}
             onChange={handleStatusChange} required/>
             <CFormFeedback invalid>Please enter operation head number.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="gstId">GST #:</CFormLabel>
            <CFormInput type="text" name="gst" id="gstId" value={tableData.gst} onChange={handleStatusChange}/>

          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="bankDetailsId">Bank Details #:</CFormLabel>
            <CFormInput type="text" name="bankDetails" id="bankDetailsId" value={tableData.bankDetails} onChange={handleStatusChange} required/>

          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="emailId">Email Id:</CFormLabel>
            <CFormInput type="text" name="email" id="emailId" value={tableData.email}
            onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter Email Id.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="registeredAddressId">Registered Address:</CFormLabel>
            <CFormInput type="text" name="registeredAddress" id="registeredAddressId" value={tableData.registeredAddress}/>
            <CFormFeedback invalid>Please enter registered address.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="websiteId">Website:</CFormLabel>
            <CFormInput type="text" name="website" id="websiteId" value={tableData.website}
            onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter website address.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="panId">PAN:</CFormLabel>
            <CFormInput type="text" name="pan" id="panId" value={tableData.hsn}
            onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter PAN.</CFormFeedback>
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

export default AddCompanyDetails;

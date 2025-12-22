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
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CTableRow,
  CAlert,
  CFormFeedback
} from '@coreui/react';
import Loader from './../Loader';
import API from '../../services/apiService';
import AlertMessage from '../shared/AlertMessage';

// Main Component
const EditRider = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [validated, setValidated] = useState(false)
  const [submitState, setSubmitState] = useState(false);
  const [loading, setLoading] = useState(true);

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
      formData.forEach((value, key) => {
        tableData[key] = value;
      });
      try {
        const response = await API.post('/riders/update', tableData);

        if (response.status !== 200) {
          setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
        } else {
          const parsedResp = JSON.parse(response.data.body);
          setAlertMsg({msg: parsedResp['message'], status: 'success'});
        }
      } catch (error) {
        // Handle errors here
        setAlertMsg({msg: 'There was an error with the POST request:', status: 'danger'});
      }
      setShowAlert(true);
      setSubmitState(false);
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
              const response = await API.get(`/riders/edit?id=${searchParams.get('id')}`);
              if (response.status !== 200) {
                 setAlertMsg({msg: 'Failed to fetch rider details. Please contact administrator.', status: 'danger'});
                 setShowAlert(true);
              } else {
                  const parsedData = JSON.parse(response.data.body);
                  setTableData(parsedData);
              }
              setLoading(false);
            } catch (error) {
              console.error('Error fetching data:', error);
              setAlertMsg({msg: 'Failed to fetch rider details. Please contact administrator.', status: 'danger'});
              setShowAlert(true);
              setLoading(false);
            }
          };

          fetchData();
        }, [])

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
              <strong>Update Rider Details</strong>
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
            <CFormInput type="text" name="firstNameId" id="firstNameId" value={tableData.firstNameId} onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter first name.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="lastNameId">Last Name</CFormLabel>
            <CFormInput type="text" name="lastNameId" id="lastNameId" value={tableData.lastNameId} onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter last name.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="phoneNumberId">Phone Number</CFormLabel>
            <CFormInput type="text" name="phoneNumberId" id="phoneNumberId" value={tableData.phoneNumberId} onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter phone number.</CFormFeedback>
          </CCol>
          <CCol md={4}>
             <CFormLabel htmlFor="altPhoneNumberId">Alternate Phone Number</CFormLabel>
             <CFormInput type="text" name="altPhoneNumberId" id="altPhoneNumberId" value={tableData.altPhoneNumberId} onChange={handleStatusChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId">Address</CFormLabel>
            <CFormInput type="text" name="addressId" id="addressId" value={tableData.addressId} onChange={handleStatusChange} required/>
            <CFormFeedback invalid>Please enter address.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="emailId">Email Id</CFormLabel>
            <CFormInput type="text" name="emailId" id="emailId" onChange={handleStatusChange} />
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

export default EditRider;

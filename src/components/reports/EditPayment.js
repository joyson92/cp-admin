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
  CButton
} from '@coreui/react';

// Main Component
const EditPayment = () => {
  const [tableData, setTableData] = useState([]);

  const handleSubmit = async(event) => {
      event.preventDefault()
      const formData = new FormData(event.target);
      const formObj = {};
      formData.forEach((value, key) => {
        formObj[key] = value;
      });
      try {
      console.log(formObj);
            const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/pricing/add', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formObj),
              mode: 'no-cors'
            });
            console.log(response)
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }

            // If the response is successful, you can handle it here
            console.log('POST request successful');
          } catch (error) {
            // Handle errors here
            console.error('There was an error with the POST request:', error);
          }
    }

  return (
  <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Add Pricing Details</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          onSubmit={handleSubmit}
        >
          <CCol md={4}>
            <CFormLabel htmlFor="categoryId">Category:</CFormLabel>
            <CFormInput type="text" name="category" id="categoryId" />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="priceId">Price:</CFormLabel>
            <CFormInput type="text" name="price" id="priceId" />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="gstId">GST %:</CFormLabel>
            <CFormInput type="text" name="gst" id="gstId" />
          </CCol>

          <CCol xs={12}>
            <CButton color="primary" type="submit">
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

export default EditPayment;

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
  CAlert
} from '@coreui/react';
import Loader from './../Loader';

// Main Component
const EditPrice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subQty, setSubQty] = useState(false);

  const handleSubmit = async(event) => {
      event.preventDefault()
      setSubmitState(true);
      setLoading(true);
      const formData = new FormData(event.target);
      const formObj = {};
      formData.forEach((value, key) => {
        tableData[key] = value;
      });
      try {
            const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/pricing/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(tableData)
            });

            if (!response.ok) {
               setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
               setShowAlert(true);
               setSubmitState(false);
               setLoading(false);
               //throw new Error('Network response was not ok');
            } else {
               const resp = await response.json();
               const parsedResp = JSON.parse(resp.body);
               setLoading(false);
               setAlertMsg({msg: parsedResp['message'], status: parsedResp['status']});
               setShowAlert(true);
               setSubmitState(false);

            }

          } catch (error) {
            // Handle errors here
            console.error('There was an error with the POST request:', error);
            setLoading(false);
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
      if (value == 'Subscription' || name == 'subQty') {
        setSubQty(true);
      } else {
        setSubQty(false);
      }
    };

    const searchParams = new URLSearchParams(location.search);
    const formObj = {};
    formObj['price_id'] = searchParams.get('id');

    useEffect(() => {
          const fetchData = async () => {
            try {
              const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/pricing/edit',{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(formObj)
              });

              if (!response.ok) {
                setLoading(false);
                 setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
                 setShowAlert(true);
              } else {
                 const data = await response.json();
                 const parsedData = JSON.parse(data.body);

                 setTableData(parsedData);
                 if (parsedData.hasOwnProperty('subQty')){
                    setSubQty(true);
                 }
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
              <strong>Update Pricing Details</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          onSubmit={handleSubmit}
        >
          <CCol md={4}>
            <CFormLabel htmlFor="typeId">Type:</CFormLabel>
            <CFormSelect
              aria-label="Default select example"
              name="type" id="typeId"
              value={tableData.type}
              onChange={handleStatusChange}
              options={[
                'Please select type',
                { label: 'Dry Cleaning - SAC 999712', value: '1'},
                { label: 'Laundry - SAC 999719', value: '2' },
                { label: 'Laundry W&P - SAC 999719', value: '3' },
                { label: 'Laundry W&F - SAC 999719', value: '4' },
                { label: 'Steam Press - SAC 999714', value: '5'},
                { label: 'Shoes & Bags - SAC 999712', value: '6'},
                { label: 'Home Care - SAC 999712', value: '7'}
              ]}
            />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="categoryId">Category:</CFormLabel>
            <CFormInput type="text" name="category" id="categoryId" value={tableData.category} onChange={handleStatusChange}/>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="pricedAtId">Priced At:</CFormLabel>
            <CFormSelect
              aria-label="Default select example"
              name="pricedAt" id="pricedAtId"
              value={tableData.pricedAt}
              onChange={handleStatusChange}
              options={[
                'Please select',
                { label: 'Kg', value: 'Kg'},
                { label: 'Item', value: 'Item' },
                { label: 'Sqft', value: 'Sqft'},
                { label: 'Subscription', value: 'Subscription'}
              ]}
            />
          </CCol>
        {subQty ? (
          <CCol md={4}>
            <CFormLabel htmlFor="subQtyId">Subscription Qty:</CFormLabel>
            <CFormInput type="text" name="subQty" id="subQtyId" value={tableData.subQty} onChange={handleStatusChange}/>
          </CCol>
          ): null}
          <CCol md={4}>
            <CFormLabel htmlFor="priceId">Price:</CFormLabel>
            <CFormInput type="text" name="price" id="priceId" value={tableData.price} onChange={handleStatusChange}/>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="gstId">GST %:</CFormLabel>
            <CFormInput type="text" name="gst" id="gstId" value={tableData.gst} onChange={handleStatusChange}/>
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

export default EditPrice;

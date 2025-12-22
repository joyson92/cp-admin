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
const AddExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ msg: '', status: 'success', redirect: '' });
  const [submitState, setSubmitState] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [payers, setPayers] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
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
          formData.forEach((value, key) => {
            expenseData[key] = value;
          });
          try {
            const response = await API.post('/expenses/add', expenseData);

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


  useEffect(() => {
    fetchData();
  }, []);

    const fetchData = async () => {
      try {
        const response = await API.get('/expenses/create');
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to fetch expenses. Please contact administrator.', status: 'danger'});
            setShowAlert(true);
        }
        const parsedData = JSON.parse(response.data.data);
        setCategories(parsedData['category']);
        setLocations(parsedData['loc']);
        setPayers(parsedData['payers']);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };


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
              <strong>Add Expense Details</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >
          <CCol md={4}>
            <CFormLabel htmlFor="typeId">Category Type:</CFormLabel>
            <CFormSelect
              aria-label="Default select example"
              name="type" id="typeId"
              required
            >
                 <option value="">Select</option>
                 {categories.map((item, index) => (
                    <option key={index} value={`${item.id}`}>
                    {item.name}
                    </option>
                 ))}
            </CFormSelect>
            <CFormFeedback invalid>Please select category type.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="expenseDateId">Expense Date:</CFormLabel>
           <DatePicker
              selected={expenseData.expense_dt}
              onChange={(date) => setExpenseData({...expenseData, expense_dt: format(date, 'yyyy-MM-dd')})}
              dateFormat="MM-yyyy"
              placeholderText="Select date"
              autoComplete="off"
              className="form-control"
              required
              />
           <CFormFeedback invalid>Please enter expense date.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="paidToId">Paid To:</CFormLabel>
            <CFormSelect
              aria-label="Default select example"
              name="paidTo" id="paidToId"
              required
            >
                 <option value="">Select</option>
                 {payers.map((item, index) => (
                    <option key={index} value={`${item.id}`}>
                    {item.name}
                    </option>
                 ))}
            </CFormSelect>
            <CFormFeedback invalid>Please select paid to.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="locationId">Location:</CFormLabel>
            <CFormSelect
              aria-label="Default select example"
              name="location" id="locationId"
              required
            >
                 <option value="">Select</option>
                 {locations.map((item, index) => (
                    <option key={index} value={`${item.id}`}>
                    {item.name}
                    </option>
                 ))}
            </CFormSelect>
            <CFormFeedback invalid>Please select location.</CFormFeedback>
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="amountId">Amount:</CFormLabel>
            <CFormInput type="text" name="amount" id="amountId" required/>
            <CFormFeedback invalid>Please enter amount.</CFormFeedback>
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="paymentId">Payment Mode:</CFormLabel>
            <CFormSelect
              aria-label="Default select example"
              name="paymentMode"
              id="paymentId"
              required
              options={[
                { label: 'Please select mode', value: ''},
                { label: 'UPI', value: 'UPI'},
                { label: 'Bank Transfer', value: 'Bank Transfer' },
                { label: 'Cash', value: 'Cash'}
              ]}
              />
            <CFormFeedback invalid>Please enter payment mode.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="isGstId">GST Applicable:</CFormLabel>
            <CFormSelect
              aria-label="Default select example"
              name="is_gst"
              id="isGstId"
              required
              options={[
                { label: 'Select', value: ''},
                { label: 'Yes', value: 'Y'},
                { label: 'No', value: 'N' }
              ]}
              />
            <CFormFeedback invalid>Please enter payment mode.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="commentsId">Comments:</CFormLabel>
            <CFormTextarea type="text" name="comments" id="commentsId" />
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

export default AddExpense;

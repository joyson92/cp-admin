import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  CTableRow,
  CTableHeaderCell,
  CTable,
  CTableDataCell,
  CTableHead,
  CTableBody,
  CAlert
} from '@coreui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInDays } from 'date-fns';
import Loader from './../Loader';


const EditSubscription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [subscribedDays, setSubscribedDays] = useState(0);

  const [rows, setRows] = useState([{category: '', qty: '', type:'', sacCode:'', disc: '', price: 0, total:0}]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);

  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000); // Adjust the duration (in milliseconds) as needed

      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }, [showAlert]);


  const handleChange = (index, column, value) => {
      const updatedRows = [...rows];
      if(column === 'qty' && !updatedRows[index].hasOwnProperty('unit')) {
          updatedRows[index]['qty'] = value;
          updatedRows[index]['total'] = Math.round(updatedRows[index]['price'] * value );
          handleChange(index, 'disc', updatedRows[index]['disc']? updatedRows[index]['disc'] : 0);
      } else if(column === 'disc') {
          updatedRows[index]['disc'] = value;
          let qty = updatedRows[index]['qty'];
          updatedRows[index]['total'] = Math.round(qty * (updatedRows[index]['price'] - (updatedRows[index]['price'] * (value / 100))));
      } else {
          const [category, price, type, sacCode, pricedAt] = value.split('#');
          updatedRows[index] = {category: '', qty: '', disc: '', total:0};
          updatedRows[index]['type'] = type;
          updatedRows[index]['sacCode'] = sacCode;
          updatedRows[index][column] = category;
          updatedRows[index]['price'] = price;

          orderData['subscription'] = 'Y';
      }
      setRows(updatedRows);
    };

  const handleStatusChange = (e) => {
      const { name, value } = e.target;
      setOrderData({ ...orderData, [name]: value });
  };

  const searchParams = new URLSearchParams(location.search);
  const cust_id = searchParams.get('custid');
  const invoice_id = searchParams.get('id');

  const fetchSub = async() => {
      setLoading(true);
          const response = await fetch(`https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/reports/subscriptions?custid=${cust_id}&id=${invoice_id}`);
          if (!response.ok) {
  //           throw new Error('Failed to fetch data');
          }
          const responseData = await response.json();
          const parsedResponse = JSON.parse(responseData.data);
          setOrderData(parsedResponse);
          setRows(parsedResponse.plan_details);
          setLoading(false);
  };

  useEffect(() => {
    fetchSub();
  }, [cust_id, invoice_id]);



  const handleSubmit = async(event) => {
      const form = event.currentTarget
      setLoading(true);
      event.preventDefault()
      setSubmitState(true);
      const formData = new FormData(event.target);
      const submitData = {}
      submitData['sub_start'] = orderData.start_dt;
      submitData['sub_end'] = orderData.end_dt;
      submitData['invoice_id'] = orderData.invoice_id;
      submitData['cust_id'] = cust_id;

      try {
            const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/subscriptions/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(submitData)
            });

            if (!response.ok) {
              setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
              setShowAlert(true);
              setSubmitState(false);
            } else {
                const resp = await response.json();
                const parsedResp = JSON.parse(resp.data);
                setAlertMsg({msg: parsedResp['message'], status: parsedResp['status']});
                setShowAlert(true);
                setSubmitState(false);
            }
            setLoading(false);
          } catch (error) {
            console.error('There was an error with the POST request:', error);
            setLoading(false);
          }
    }


    useEffect(() => {
        const startDt = new Date(orderData.start_dt);
        const endDt = new Date(orderData.end_dt);
        const diff = differenceInDays(endDt, startDt);
        setSubscribedDays( isNaN(diff) ? 0 : diff + 1);
    }, [orderData.end_dt, orderData.start_dt]);

  return (
  <CRow>
       <div className="alert-container">
          {showAlert && (
             <CAlert color={alertMsg.status} variant="solid">{alertMsg.msg}</CAlert>
          )}
       </div>
       <> {loading ? ( <Loader /> ): ''} </>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Update Subscription</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >

        <CCol md={4}>
           <CFormLabel htmlFor="orderDateId"><b>Invoice Date :</b> {orderData.invoice_dt ? format(orderData.invoice_dt, 'dd-MM-yyyy') : null} </CFormLabel>
        </CCol>
        <CCol md={4}>
            <CFormLabel htmlFor="invoiceId"><b>Invoice # :</b> {orderData.invoice_id}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="firstNameId"><b>Customer Name :</b> {orderData.cust_name}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="phoneNumberId"><b>Phone Number :</b> {orderData.ph_number}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId"><b>Address :</b> {orderData.add}</CFormLabel>
          </CCol>
           <CCol md={4}>
             <CFormLabel htmlFor="typeId"><b>Process Type :</b> {orderData.type}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="startDtId"><b>Start Date :</b></CFormLabel>
              <DatePicker
                 selected={orderData.start_dt}
                 onChange={(date) => setOrderData({...orderData, start_dt: format(date, 'yyyy-MM-dd')})}
                 dateFormat="dd-MM-yyyy"
                 placeholderText="Select date"
                 className="form-control"
                 />
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="endDtId"><b>End Date :</b></CFormLabel>
              <DatePicker
                  selected={orderData.end_dt}
                  onChange={(date) => setOrderData({...orderData, end_dt: format(date, 'yyyy-MM-dd')})}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select date"
                  className="form-control"
                />
           </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="subscribedDaysId"><b>Subscribed Days :</b></CFormLabel>
              <CFormInput type="text" name="subscribedDays" id="subscribedDaysId" value={subscribedDays}
                 autoComplete="off" disabled/>
           </CCol>

           <CCol xs={12}>
           <CCardHeader>Plan Details</CCardHeader>
           <CCardBody>
              <CTable hover>
                <CTableHead>
                   <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Category</CTableHeaderCell>
                      <CTableHeaderCell>Price</CTableHeaderCell>
                      <CTableHeaderCell>Qty.</CTableHeaderCell>
                      <CTableHeaderCell>Disc.</CTableHeaderCell>
                      <CTableHeaderCell>Total</CTableHeaderCell>
                   </CTableRow>
                </CTableHead>
                <CTableBody>
                   {rows.map((row, index) => (
                   <CTableRow key={index}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>
                        {row.category}
                      </CTableDataCell>
                      <CTableDataCell>{row.price}</CTableDataCell>
                      <CTableDataCell>
                        {row.qty}
                      </CTableDataCell>

                      <CTableDataCell>
                         {row.disc}
                      </CTableDataCell>
                      <CTableDataCell>
                        {row.total}
                      </CTableDataCell>

                   </CTableRow>
                     )
                   )}
                   <CTableRow>
                     <CTableDataCell></CTableDataCell>
                      <CTableHeaderCell colSpan={2}>
                            Sub-Total
                      </CTableHeaderCell>
                      <CTableDataCell>{orderData.qty}</CTableDataCell>

                      <CTableDataCell></CTableDataCell>
                      <CTableDataCell>{orderData.subTotal}</CTableDataCell>
                   </CTableRow>
                   <CTableRow>
                       <CTableDataCell></CTableDataCell>
                       <CTableHeaderCell colSpan={2}>
                          GST 18%
                       </CTableHeaderCell>
                      <CTableDataCell></CTableDataCell>

                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell>{orderData.gst}</CTableDataCell>
                   </CTableRow>
                   <CTableRow>
                       <CTableDataCell></CTableDataCell>
                       <CTableHeaderCell colSpan={2}>
                          Total
                       </CTableHeaderCell>
                       <CTableDataCell></CTableDataCell>

                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell>{orderData.total}</CTableDataCell>
                   </CTableRow>
                </CTableBody>
              </CTable>
           </CCardBody>
           </CCol>

          <CCol md={4}>
            <CButton color="success" onClick = {() => {
              navigate('/subscriptions');
            }}>
              Back
            </CButton>
          </CCol>
          <CCol md={4}>
            <CButton color="primary" type="submit" disabled={submitState}>
             Update
            </CButton>
          </CCol>
        </CForm>
        </CCardBody>
       </CCard>
    </CCol>
</CRow>
  );
};

export default EditSubscription;

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
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CTableRow,
  CFormSelect,
  CTableHeaderCell,
  CTable,
  CTableDataCell,
  CTableHead,
  CTableBody,
  CAlert
} from '@coreui/react';

import PrintBill from './PrintBill';
import PrintBillSubscription from './PrintBillSubscription';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Loader from './../Loader';

// Main Component
const ViewInvoice = () => {
  const location = useLocation();
  const [orderData, setOrderData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const [deliveryType, setDeliveryType] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([{category: '', qty: '', type:'', sacCode:'', disc: '', price: 0, total: 0}]);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [payments, setPayments] = useState([]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 5000); // Adjust the duration (in milliseconds) as needed

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [showAlert]);


  const searchParams = new URLSearchParams(location.search);

  const formObj = {};
  formObj['invoice_id'] = searchParams.get('id');
  formObj['order_id'] = searchParams.get('oid');
  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/invoices/fetchinvoice',{
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObj)
          });

          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const data = await response.json();
          const parsedData = JSON.parse(data.data);
          setOrderData(parsedData);
          setRows(parsedData.cloth_details);
          setDeliveryType(parsedData.deliveryType == "Standard" ? 1 : 2);
          if (Array.isArray(parsedData.payments)) {
            setPayments(parsedData.payments);
          }

          setLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
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
              <strong>View Invoice</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
        className="row g-3 needs-validation">
        <CCol md={4}>
           <CFormLabel htmlFor="orderId">Order Id : </CFormLabel><br/>
           <CFormLabel id="orderId">{orderData.order_id}-{orderData.no_of_orders}</CFormLabel>
        </CCol>
        <CCol md={4}>
           <CFormLabel htmlFor="orderDateId">Order Date :</CFormLabel><br/>
           <CFormLabel id="orderDateId">{orderData && orderData.order_dt ?
                format(orderData.order_dt, 'dd-MM-yyyy') : null}
           </CFormLabel>
        </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="firstNameId">Customer Name :</CFormLabel><br/>
            <CFormLabel id="firstNameId">{orderData.contact_person}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="phoneNumberId">Phone Number :</CFormLabel><br/>
            <CFormLabel id="phoneNumberId">{orderData.contact_number}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId">Address :</CFormLabel><br/>
            <CFormLabel id="addressId">{orderData.address}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="emailId">Schedule Time :</CFormLabel><br/>
            <CFormLabel id="emailId">{orderData.timing}</CFormLabel>
          </CCol>
           <CCol md={4}>
            <CFormLabel htmlFor="statusId">Status :</CFormLabel><br/>
            <CFormLabel id="statusId">{orderData.status}</CFormLabel>
           </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="emailId">Tag : </CFormLabel><br/>
              <CFormLabel id="emailId">{orderData.tag}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="riderId">Pickup Rider :</CFormLabel><br/>
              <CFormLabel id="riderId">{orderData && orderData.assigned_to ?
               ( <>
                 {orderData.assigned_to.split('#')[0]} {orderData.assigned_to.split('#')[1]}
                 </>) : (<> </>)}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId">Delivery Date :</CFormLabel><br/>
              <CFormLabel id="deliveryDtId">{orderData && orderData.delivery_dt ?
                    format(orderData.delivery_dt, 'dd-MM-yyyy') : null}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId">Invoice # :</CFormLabel><br/>
              <CFormLabel id="deliveryDtId">{orderData.invoice_no}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="invoiceDtId">Invoice Date :</CFormLabel><br/>
              <CFormLabel id="invoiceDtId">{orderData.invoice_dt}</CFormLabel>

           </CCol>

           <CCol md={4}>
              <CFormLabel htmlFor="customerGSTId">Customer GST (if any) :</CFormLabel><br/>
              <CFormLabel id="customerGSTId">{orderData.customerGST}</CFormLabel>

           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryChargesId">Delivery charges (if any) :</CFormLabel><br/>
              <CFormLabel id="deliveryChargesId">{orderData.deliveryCharges}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryRiderId">Delivery Rider :</CFormLabel><br/>
              <CFormLabel id="deliveryRiderId">
              {orderData && orderData.delivery_rider ?
                             ( <>
                               {orderData.delivery_rider.split('#')[0]} {orderData.delivery_rider.split('#')[1]}
                               </>) : (<> </>)}
              </CFormLabel>

           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="branchId"><b>Branch :</b></CFormLabel><br/>
              <CFormLabel id="branchId">{orderData.branch}</CFormLabel>
           </CCol>
           <CCol xs={12}>
           <CCardHeader>Cloth Details</CCardHeader>
           <CCardBody>
              <CTable hover>
                <CTableHead>
                   <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Category</CTableHeaderCell>
                      <CTableHeaderCell>Service</CTableHeaderCell>
                      <CTableHeaderCell>Price</CTableHeaderCell>
                      <CTableHeaderCell>Qty.</CTableHeaderCell>
                      <CTableHeaderCell>
                      {orderData && orderData.unitType !== undefined ?
                         orderData.unitType
                      : null}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Disc.</CTableHeaderCell>
                      <CTableHeaderCell>Total (&#8377;)</CTableHeaderCell>
                   </CTableRow>
                </CTableHead>
                <CTableBody>
                   {rows.map((row, index) => (
                   <CTableRow key={index}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{row.category}</CTableDataCell>
                      <CTableDataCell>{row.type} - {row.sacCode}</CTableDataCell>
                      <CTableDataCell>{row.disc < 0 ? (row.price * Math.abs(row.disc)/100) + row.price * deliveryType : row.price * deliveryType}</CTableDataCell>
                      <CTableDataCell>{row.qty}</CTableDataCell>
                      <CTableDataCell>
                      {row.unit !== undefined ?
                         row.unit
                      : null}
                      </CTableDataCell>
                      <CTableDataCell>{row.disc < 0 ? 0 : row.disc}</CTableDataCell>
                      <CTableDataCell>{row.total}</CTableDataCell>
                   </CTableRow>
                     )
                   )}
                   <CTableRow>
                     <CTableDataCell></CTableDataCell>
                      <CTableHeaderCell colSpan={2}>
                            Sub-Total
                      </CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                      <CTableDataCell>{orderData.qty}</CTableDataCell>
                      <CTableDataCell></CTableDataCell>
                      <CTableHeaderCell></CTableHeaderCell>
                      <CTableDataCell>&#8377;{orderData.subTotal}</CTableDataCell>
                      <CTableDataCell></CTableDataCell>
                   </CTableRow>
                   {orderData.deliveryCharges && orderData.deliveryCharges !== '' ?
                       <CTableRow>
                          <CTableDataCell></CTableDataCell>
                          <CTableHeaderCell colSpan={2}>
                             Delivery Charges
                          </CTableHeaderCell>
                          <CTableHeaderCell></CTableHeaderCell>
                          <CTableDataCell></CTableDataCell>
                          <CTableDataCell></CTableDataCell>
                          <CTableHeaderCell></CTableHeaderCell>
                          <CTableDataCell>&#8377;{orderData.deliveryCharges}</CTableDataCell>
                          <CTableDataCell></CTableDataCell>
                       </CTableRow>
                   : null}
                   <CTableRow>
                       <CTableDataCell></CTableDataCell>
                       <CTableHeaderCell colSpan={2}>
                          GST 18%
                       </CTableHeaderCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell>&#8377;{orderData.gst}</CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                   </CTableRow>
                   <CTableRow>
                       <CTableDataCell></CTableDataCell>
                       <CTableHeaderCell colSpan={2}>
                          Total
                       </CTableHeaderCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>

                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell>&#8377;{orderData.total}</CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                   </CTableRow>
                   {orderData.advance_amt && orderData.advance_amt !== '' ?
                   <CTableRow>
                       <CTableDataCell></CTableDataCell>
                       <CTableHeaderCell colSpan={2}>
                          Prepaid
                       </CTableHeaderCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>

                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell>&#8377;{orderData.advance_amt}</CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                   </CTableRow>
                   : null }
                   {orderData.due_amt && orderData.due_amt !== '' ?
                   <CTableRow>
                       <CTableDataCell></CTableDataCell>
                       <CTableHeaderCell colSpan={2}>
                          Total Due
                       </CTableHeaderCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>

                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell>&#8377;{orderData.due_amt}</CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                   </CTableRow>
                   : null }
                </CTableBody>
              </CTable>
           </CCardBody>
           </CCol>
           <CCol xs={12}>
              <CCardHeader>Payment Details</CCardHeader>

              {Array.isArray(payments) && payments.length > 0 ? (
              <CCardBody>
                <CTable hover>
                    <CTableHead>
                       <CTableRow>
                          <CTableHeaderCell scope="col">#</CTableHeaderCell>
                          <CTableHeaderCell>Payment Date</CTableHeaderCell>
                          <CTableHeaderCell>Mode</CTableHeaderCell>
                          <CTableHeaderCell>Amount</CTableHeaderCell>
                       </CTableRow>
                    </CTableHead>
                    <CTableBody>
                    {payments.map((payment, index) => (
                       <CTableRow key={index}>
                          <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                          <CTableDataCell>{payment.payment_dt}
                          </CTableDataCell>
                          <CTableDataCell>{payment.mode}</CTableDataCell>
                          <CTableDataCell style={{ textAlign: 'right' }}>{payment.amount}</CTableDataCell>
                       </CTableRow>
                    ))}
                    <CTableRow>
                        <CTableHeaderCell colSpan='2'></CTableHeaderCell>
                       <CTableHeaderCell>Payment Received:</CTableHeaderCell>
                       <CTableHeaderCell style={{ textAlign: 'right' }}>&#8377; {orderData.payment_amount}</CTableHeaderCell>
                    </CTableRow>
                    <CTableRow>
                        <CTableHeaderCell colSpan='2'></CTableHeaderCell>
                        <CTableHeaderCell>Payment Pending:</CTableHeaderCell>
                        <CTableHeaderCell style={{ textAlign: 'right' }}>&#8377; {orderData.total - orderData.payment_amount - orderData.short_fall - (orderData.advance_amt ? orderData.advance_amt : 0)}</CTableHeaderCell>
                    </CTableRow>
                    <CTableRow>
                        <CTableHeaderCell colSpan='2'></CTableHeaderCell>
                        <CTableHeaderCell>Shortfall amount:</CTableHeaderCell>
                        <CTableHeaderCell style={{ textAlign: 'right' }}>{orderData.short_fall}</CTableHeaderCell>
                    </CTableRow>
                    </CTableBody>
                 </CTable>
                </CCardBody>
                ): (
                <CCardBody>
                 <CCol md={4}>
                    <CFormLabel htmlFor="paymentDateId">Payment Date : {orderData.payment_date}</CFormLabel>

                 </CCol>
                 <CCol md={4}>
                    <CFormLabel htmlFor="paymentModeId">Mode : {orderData.payment_mode}</CFormLabel>

                 </CCol>
                 <CCol md={4}>
                    <CFormLabel htmlFor="paymentAmountId">Amount : {orderData.payment_amount}</CFormLabel>

                 </CCol>
                 <CCol md={4}>
                    <CFormLabel htmlFor="shortFallAmountId">Short Fall : {orderData.short_fall}</CFormLabel>

                 </CCol>
                 </CCardBody>
                 )}

           </CCol>
           <CCol md={4}>
              {orderData.subscription && orderData.subscription == 'Y' ? (
                <PrintBillSubscription printData={orderData}/>
              ):(
                <PrintBill printData={orderData}/>
              )}
           </CCol>

        </CForm>
        </CCardBody>
       </CCard>
    </CCol>
</CRow>
  );
};

export default ViewInvoice;

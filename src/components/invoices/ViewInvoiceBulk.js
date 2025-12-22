import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilTrash, cilPlus } from '@coreui/icons';
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
  CAlert,
  CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem
} from '@coreui/react';

import PrintBillBulkOrders from './PrintBillBulkOrders';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Loader from './../Loader';

// Main Component
const ViewInvoiceBulk = () => {
  const location = useLocation();
  const [orderData, setOrderData] = useState([]);
  const [companyDetailsData, setCompanyDetailsData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [deliveryType, setDeliveryType] = useState(1);
  const [loading, setLoading] = useState(true);

  const [rows, setRows] = useState([]);
  const [payments, setPayments] = useState([{payment_dt: '', mode: '', amount:0}]);


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
          if (Array.isArray(parsedData.payments)) {
            setPayments(parsedData.payments);
          }
          setRows(parsedData.orders);

          const cd_response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/companydetails');
          if (!cd_response.ok) {
            setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
            setShowAlert(true);
          }
          const cd_data = await cd_response.json();
          const parsedCD_Data = JSON.parse(cd_data.body);
          setCompanyDetailsData(parsedCD_Data);

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
              <strong>Invoice Details # {orderData.invoice_no}</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
        className="row g-3 needs-validation"

        >
          <CCol md={4}>
            <CFormLabel htmlFor="firstNameId"><b>Customer Name :</b></CFormLabel><br/>
            <CFormLabel id="firstNameId">{orderData.contact_person}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="phoneNumberId"><b>Phone Number :</b></CFormLabel><br/>
            <CFormLabel id="phoneNumberId">{orderData.contact_number}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId"><b>Address :</b></CFormLabel><br/>
            <CFormLabel id="addressId">{orderData.address}</CFormLabel>
          </CCol>

           <CCol md={4}>
              <CFormLabel htmlFor="invoiceDtId"><b>Invoice Date :</b></CFormLabel><br/>
              <CFormLabel id="invoiceDtId">{orderData.invoice_dt ? format(orderData.invoice_dt, 'dd-MM-yyyy') : ''}</CFormLabel>
           </CCol>

           <CCol md={4}>
              <CFormLabel htmlFor="customerGSTId"><b>Customer GST (if any) :</b></CFormLabel><br/>
              <CFormLabel id="customerGSTId">{orderData.customerGST}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="branchId"><b>Branch :</b></CFormLabel><br/>
              <CFormLabel id="branchId">{orderData.branch}</CFormLabel>
           </CCol>

           <CCol xs={12}>
           <CCardHeader><b>Order Details</b></CCardHeader>
           <CAccordion flush>
            {rows.map((order, idx) => (
            <CAccordionItem itemKey={idx}>
                <CAccordionHeader>
                    <CCol md={4}><b>Order #:</b> {order.order_id}</CCol>
                    <CCol md={4}><b>Order Date:</b> {order.order_dt ? format(order.order_dt, 'dd-MM-yyyy') : ''}</CCol>
                    <CCol md={4}><b>Delivery Date:</b> {order.delivery_dt ? format(order.delivery_dt, 'dd-MM-yyyy') : ''}</CCol>
                </CAccordionHeader>
            <CAccordionBody>

              <CTable hover>
                <CTableHead>
                   <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Category</CTableHeaderCell>
                      <CTableHeaderCell>Service</CTableHeaderCell>
                      <CTableHeaderCell>Price</CTableHeaderCell>
                      <CTableHeaderCell>Qty.</CTableHeaderCell>
                      <CTableHeaderCell>
                      {order && order.unitType !== undefined ?
                         order.unitType
                      : null}
                      </CTableHeaderCell>
                      <CTableHeaderCell>Disc.</CTableHeaderCell>
                      <CTableHeaderCell>Total (&#8377;)</CTableHeaderCell>
                   </CTableRow>
                </CTableHead>
                <CTableBody>
                   {order.cloth_details.map((row, index) => (
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
                      <CTableDataCell>
                        {row.disc}
                      </CTableDataCell>
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
                      <CTableDataCell>{order.qty}</CTableDataCell>
                      <CTableDataCell></CTableDataCell>
                      <CTableHeaderCell></CTableHeaderCell>
                      <CTableDataCell>&#8377;{order.subTotal}</CTableDataCell>
                      <CTableDataCell></CTableDataCell>
                   </CTableRow>

                   <CTableRow>
                       <CTableDataCell></CTableDataCell>
                       <CTableHeaderCell colSpan={2}>
                          GST 18%
                       </CTableHeaderCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell>&#8377;{order.gst}</CTableDataCell>
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
                       <CTableDataCell>&#8377;{order.total}</CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                   </CTableRow>
                </CTableBody>
              </CTable>
             </CAccordionBody>
             </CAccordionItem>
              ))}
            </CAccordion>
           </CCol>
           <CCol xs={12}>
              <CCardHeader><b>Payment Details</b></CCardHeader>
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
                          <CTableDataCell>
                            <CFormLabel>{payment.payment_dt ? format(payment.payment_dt, 'dd-MM-yyyy') : ''}</CFormLabel>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormLabel>{payment.mode}</CFormLabel>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CFormLabel>{payment.amount}</CFormLabel>
                          </CTableDataCell>
                       </CTableRow>
                    ))}
                    <CTableRow>
                        <CTableHeaderCell colSpan='2'></CTableHeaderCell>
                       <CTableHeaderCell>Payment Received:</CTableHeaderCell>
                       <CTableHeaderCell>&#8377; {orderData.payment_amount}</CTableHeaderCell>
                    </CTableRow>
                    <CTableRow>
                        <CTableHeaderCell colSpan='2'></CTableHeaderCell>
                        <CTableHeaderCell>Payment Pending:</CTableHeaderCell>
                        <CTableHeaderCell>&#8377; {orderData.total - orderData.payment_amount - orderData.short_fall}</CTableHeaderCell>
                    </CTableRow>
                    <CTableRow>
                        <CTableHeaderCell colSpan='2'></CTableHeaderCell>
                        <CTableHeaderCell>Shortfall amount:</CTableHeaderCell>
                        <CTableHeaderCell>
                        {orderData.short_fall}</CTableHeaderCell>
                    </CTableRow>
                    </CTableBody>
                 </CTable>

              </CCardBody>
           </CCol>
           <CCol md={4}>
              <PrintBillBulkOrders printData={orderData}/>
           </CCol>


        </CForm>
        </CCardBody>
       </CCard>
    </CCol>
</CRow>
  );
};

export default ViewInvoiceBulk;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  CAlert
} from '@coreui/react';

import PrintBill from './PrintBill';
import { format } from 'date-fns';

// Main Component
const ViewOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const [deliveryType, setDeliveryType] = useState(1);

  const [rows, setRows] = useState([{category: '', qty: '', type:'', sacCode:'', disc: '', price: 0, total:0}]);



  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 5000); // Adjust the duration (in milliseconds) as needed

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [showAlert]);





  const handleChange = (index, column, value) => {
    const updatedRows = [...rows];
    if(column == 'qty') {
        updatedRows[index]['qty'] = value;
        updatedRows[index]['total'] = updatedRows[index]['price'] * value;
    } else {
        const [category, price] = value.split('#');
        updatedRows[index][column] = category;
        updatedRows[index]['price'] = price;
        updatedRows[index]['total'] = updatedRows[index]['qty'] * price;
    }
    setRows(updatedRows);
  };

  const handleStatusChange = (e) => {
      const { name, value } = e.target;
      setOrderData({ ...orderData, [name]: value });
  };

  const searchParams = new URLSearchParams(location.search);

  const formObj = {};
  formObj['order_id'] = searchParams.get('id');
  formObj['order_no'] = searchParams.get('orderNo');

  useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/orders/fetchorder',{
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

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }, []);




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
              <strong>Order Details - {orderData.order_id}-{orderData.no_of_orders}</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
        className="row g-3 needs-validation">

        <CCol md={4}>
           <CFormLabel htmlFor="orderDateId">Order Date :</CFormLabel><br/>
           <CFormLabel id="orderDateId">{orderData && orderData.order_dt ? format(orderData.order_dt, 'dd-MM-yyyy') : null}</CFormLabel>
        </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="firstNameId">Customer Name :</CFormLabel><br/>
            <CFormLabel id="firstNameId">{orderData.contact_person}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="phoneNumberId">Phone Number ({orderData.whatsapp_number ? orderData.whatsapp_number : ''}):</CFormLabel><br/>
            <CFormLabel id="phoneNumberId">{orderData.contact_number}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId">Address :</CFormLabel><br/>
            <CFormLabel id="addressId">{orderData.address}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="emailId">Schedule Time ({orderData.scheduled_for ? orderData.scheduled_for.split("-")[0]: ''}):</CFormLabel><br/>
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
              <CFormLabel htmlFor="riderId">Rider :</CFormLabel><br/>
              <CFormLabel id="riderId">{orderData && orderData.assigned_to ?
               ( <>
                 {orderData.assigned_to.split('#')[0]} {orderData.assigned_to.split('#')[1]}
                 </>) : (<> </>)}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId">Pickup Date :</CFormLabel><br/>
              <CFormLabel id="deliveryDtId">{orderData && orderData.pickup_dt ?
                 format(orderData.pickup_dt, 'dd-MM-yyyy') : null}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId">Delivery Date :</CFormLabel><br/>
              <CFormLabel id="deliveryDtId">{orderData && orderData.delivery_dt ?
                    format(orderData.delivery_dt, 'dd-MM-yyyy') : null}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId">Delivery Type :</CFormLabel><br/>
              <CFormLabel id="deliveryDtId">{orderData.deliveryType}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId">Type :</CFormLabel><br/>
              <CFormLabel id="deliveryDtId">{orderData.type}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId">Invoice # :</CFormLabel><br/>
              <CFormLabel id="deliveryDtId">{orderData.invoice_no}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId">Invoice Date :</CFormLabel><br/>
              <CFormLabel id="deliveryDtId">
              {orderData && orderData.invoice_dt ?
                                  format(orderData.invoice_dt, 'dd-MM-yyyy') : null}
              </CFormLabel>
           </CCol>
           <CCol xs={12}>
           <CCardHeader>Cloth Details</CCardHeader>
           <CCardBody>
              <CTable hover>
                <CTableHead>
                   <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Category</CTableHeaderCell>
                      <CTableHeaderCell>Price</CTableHeaderCell>
                      <CTableHeaderCell>Qty.</CTableHeaderCell>
                      {orderData && orderData.unitType !== undefined ?
                         <CTableHeaderCell>{orderData.unitType}</CTableHeaderCell>
                           : <CTableHeaderCell></CTableHeaderCell>}
                      <CTableHeaderCell>Disc.</CTableHeaderCell>
                      <CTableHeaderCell>Total (&#8377;)</CTableHeaderCell>
                   </CTableRow>
                </CTableHead>
                <CTableBody>
                   {rows.map((row, index) => (
                   <CTableRow key={index}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>{row.category}</CTableDataCell>
                      <CTableDataCell>{row.price * deliveryType}</CTableDataCell>
                      <CTableDataCell>{row.qty}</CTableDataCell>
                      <CTableDataCell>
                        {row.unit !== undefined ? row.unit : null}
                      </CTableDataCell>
                      <CTableDataCell>{row.disc}</CTableDataCell>
                      <CTableDataCell>{row.total}</CTableDataCell>
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
                      <CTableDataCell></CTableDataCell>
                      <CTableDataCell>&#8377;{orderData.subTotal}</CTableDataCell>
                   </CTableRow>
                   {orderData.deliveryCharges && orderData.deliveryCharges !== '' ?
                       <CTableRow>
                          <CTableDataCell></CTableDataCell>
                          <CTableHeaderCell colSpan={2}>
                             Delivery Charges
                          </CTableHeaderCell>
                          <CTableHeaderCell></CTableHeaderCell>
                          <CTableDataCell></CTableDataCell>
                          <CTableHeaderCell></CTableHeaderCell>
                          <CTableDataCell>&#8377;{orderData.deliveryCharges}</CTableDataCell>
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
                       <CTableDataCell>&#8377;{orderData.gst}</CTableDataCell>

                   </CTableRow>
                   <CTableRow>
                       <CTableDataCell></CTableDataCell>
                       <CTableHeaderCell colSpan={2}>
                          Total
                       </CTableHeaderCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                       <CTableDataCell>&#8377;{orderData.total}</CTableDataCell>
                   </CTableRow>
                </CTableBody>
              </CTable>
           </CCardBody>
           </CCol>


        </CForm>
        </CCardBody>
       </CCard>
    </CCol>
</CRow>
  );
};

export default ViewOrder;

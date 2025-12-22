import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
const EditInvoiceBulk = () => {
  const location = useLocation();
  const [orderData, setOrderData] = useState([]);
  const [companyDetailsData, setCompanyDetailsData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const [deliveryType, setDeliveryType] = useState(1);
  const [loading, setLoading] = useState(true);
  const loggedInUser = useSelector(state => state.auth.loggedInUser._t);

  const [rows, setRows] = useState([]);
  const [payments, setPayments] = useState([{payment_dt: '', mode: '', amount:0}]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 5000); // Adjust the duration (in milliseconds) as needed

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, [showAlert]);


  const handleStatusChange = (e) => {
      const { name, value } = e.target;
      setOrderData({ ...orderData, [name]: value });

      if(name === "deliveryCharges") {
        calcCharges(e);
      }
  };

  const calcCharges = (e) => {
    const { name, value } = e.target;
    let subTotal = parseFloat(orderData.subTotal) + (parseFloat(value) || 0);
    let gst = subTotal * 18 / 100;
    let total = Math.round(subTotal + gst);
    setOrderData({ ...orderData, [name]: value, ['total']: total, ['gst']: gst });
  }

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

  const handleSubmit = async(event) => {
        event.preventDefault()
        setSubmitState(true);
        setLoading(true);
        orderData['payments'] = payments;
        try {
              const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/invoices/update', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
              });
              if (!response.ok) {
                 setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
                 setShowAlert(true);
                 setSubmitState(false);
                 //throw new Error('Network response was not ok');
              } else {
                 const resp = await response.json();
                 const parsedResp = JSON.parse(resp.data);
                 setLoading(false);
                 setAlertMsg({msg: parsedResp['message'], status: parsedResp['status']});
                 setShowAlert(true);
                 setSubmitState(false);
              }
            } catch (error) {
              // Handle errors here
              console.error('There was an error with the POST request:', error);
            }
      }

  const removePayment = (index) => {
      const updatedPayments = [...payments];
      handleChange(index, 'amount', 0);
      updatedPayments.splice(index, 1);
      setPayments(updatedPayments);
  };

  const addPayment = () => {
      setPayments([...payments, {payment_dt: '', mode: '', amount:0}]);
  };

  const handleChange = (index, column, value) => {
    const updatedPayments = [...payments];
    updatedPayments[index][column] = value;
    if(column === 'amount') {
       let amount = 0;
       payments.forEach((e) => {
          amount += parseFloat(e[column]) || 0;
       });

       orderData.payment_amount = amount;
    }
    setPayments(updatedPayments);
  };



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
        onSubmit={handleSubmit}
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
              <CFormLabel htmlFor="deliveryDtId"><b>Invoice Date :</b></CFormLabel><br/>
              <DatePicker
                 selected={orderData.invoice_dt}
                 onChange={(date) => setOrderData({...orderData, invoice_dt: format(date, 'yyyy-MM-dd')})}
                 dateFormat="dd-MM-yyyy"
                 placeholderText="Select date"
                 className="form-control"
              />

           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="pickUpAreaId"><b>Pick-Up Area :</b></CFormLabel><br/>
              <CFormSelect
                 aria-label="Default select example"
                 value={orderData.pickUpArea}
                 name="pickUpArea" id="pickUpAreaId"
                 onChange={handleStatusChange}
              >
                 <option>Assign Pick-Up Area</option>
                 {companyDetailsData.map((item, index) => (
                    <option key={index} value={`${item.pickUpAddress}#${item.gst}#${item.email}#${item.registeredAddress}#${item.bankDetails}#${item.website}#${item.operationHeadNumber}#${item.pan}`}>
                       {item.pickUpArea}
                    </option>
                 ))}
              </CFormSelect>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="customerGSTId"><b>Customer GST (if any) :</b></CFormLabel><br/>
              <CFormInput type="text" name="customerGST" id="customerGSTId" value={orderData.customerGST}
                          onChange={handleStatusChange} />
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
           { loggedInUser === '_a1' || loggedInUser === '_sa1' ? (
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
                          <CTableHeaderCell>
                            <CButton color="primary" onClick={addPayment}>
                               <CIcon icon={cilPlus} className="float-end" width={16} />
                            </CButton>
                          </CTableHeaderCell>
                       </CTableRow>
                    </CTableHead>
                    <CTableBody>
                    {payments.map((payment, index) => (
                       <CTableRow key={index}>
                          <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                          <CTableDataCell>
                              <DatePicker
                                  selected={payment.payment_dt}
                                  onChange={(date) => handleChange(index, 'payment_dt', format(date, 'yyyy-MM-dd'))}
                                  dateFormat="dd-MM-yyyy"
                                  placeholderText="Select date"
                                  className="form-control"
                                  />
                          </CTableDataCell>
                          <CTableDataCell>
                              <CFormSelect
                                  aria-label="Default select example"
                                  value={payment.mode}
                                  id={`paymentModeId${index}`}
                                  onChange={(e) => handleChange(index, 'mode', e.target.value)}
                                  options={[
                                     { label: 'Please select mode', value: 'Pending'},
                                     { label: 'UPI', value: 'UPI'},
                                     { label: 'Bank Transfer', value: 'Bank Transfer' },
                                     { label: 'Cash', value: 'Cash'}
                                  ]}
                              />
                          </CTableDataCell>
                          <CTableDataCell>
                              <CFormInput type="text" id={`paymentAmountId${index}`} value={payment.amount}
                                onChange={(e) => handleChange(index, 'amount', e.target.value)}/></CTableDataCell>
                          <CTableDataCell>
                             <CButton color="danger" onClick={() => removePayment(index)}>
                                <CIcon icon={cilTrash} className="float-end" width={16} />
                             </CButton>
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
                            <CFormInput type="text" id="shortFall" name="short_fall" value={orderData.short_fall}
                                onChange={handleStatusChange}/></CTableHeaderCell>
                    </CTableRow>
                    </CTableBody>
                 </CTable>

              </CCardBody>
           </CCol>
           ): null}
           <CCol md={4}>
              <PrintBillBulkOrders printData={orderData}/>
           </CCol>
          <CCol md={4}>
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

export default EditInvoiceBulk;

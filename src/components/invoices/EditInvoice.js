import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CIcon from '@coreui/icons-react';
import { cilTrash, cilPlus, cilArrowLeft } from '@coreui/icons';
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
const EditInvoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [companyDetailsData, setCompanyDetailsData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const [deliveryType, setDeliveryType] = useState(1);
  const [loading, setLoading] = useState(true);
  const loggedInUser = useSelector(state => state.auth.loggedInUser._t);

  const [ridersData, setRidersData] = useState([]);
  const [rows, setRows] = useState([{category: '', qty: '', type:'', sacCode:'', disc: '', price: 0, total: 0}]);
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
          setRows(parsedData.cloth_details);
          setDeliveryType(parsedData.deliveryType == "Standard" ? 1 : 2);

          const cd_response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/companydetails');
          if (!cd_response.ok) {
            setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
            setShowAlert(true);
          }
          const cd_data = await cd_response.json();
          const parsedCD_Data = JSON.parse(cd_data.body);
          setCompanyDetailsData(parsedCD_Data);

          const ridersResp = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/riders');
          if (!ridersResp.ok) {
            setLoading(false);
            setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
            setShowAlert(true);
          }
          const ridersData = await ridersResp.json();
          const parsedRiders = JSON.parse(ridersData.body);
          setRidersData(parsedRiders);
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

  const updateClothDetails = (index, column, value) => {
      const updatedRows = [...rows];
      if(column == 'disc') {
          updatedRows[index]['disc'] = value;
          let qty = updatedRows[index]['qty'];
          if (updatedRows[index].hasOwnProperty('unit')) {
              qty = updatedRows[index]['unit'];
          }
          updatedRows[index]['total'] = Math.round(qty * (updatedRows[index]['price'] - (updatedRows[index]['price'] * (value / 100))) * deliveryType);
      }
      setRows(updatedRows);
    };

  useEffect(() => {
      calcTotal();
    }, [rows]);

  const calcTotal = () => {
      let total = 0;
      let qty = 0;
      let subTotal = 0;
      let gst = 0;
      let finalSubTotal = 0;
      rows.forEach((row) => {
          subTotal += parseFloat(row.total) || 0;
          qty += parseFloat(row.qty) || 0;
      });
      finalSubTotal = subTotal + (parseFloat(orderData.deliveryCharges) || 0);
      gst = parseFloat((finalSubTotal * 18 / 100).toFixed(2));
      total = Math.round(finalSubTotal + gst);

      setOrderData({ ...orderData, ['qty']: qty, ['subTotal']: subTotal, ['total']: total, ['gst']: gst });
    }


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
              <strong>Invoice Details - {orderData.invoice_no} - {orderData.branch}</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
        className="row g-3 needs-validation"
        onSubmit={handleSubmit}
        >
        <CCol md={4}>
           <CFormLabel htmlFor="orderId"><b>Order Id :</b> </CFormLabel><br/>
           <CFormLabel id="orderId">{orderData.order_id}-{orderData.no_of_orders}</CFormLabel>
        </CCol>
        <CCol md={4}>
           <CFormLabel htmlFor="orderDateId"><b>Order Date :</b></CFormLabel><br/>
           <CFormLabel id="orderDateId">{orderData && orderData.order_dt ?
                format(orderData.order_dt, 'dd-MM-yyyy') : null}
           </CFormLabel>
        </CCol>
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
            <CFormLabel htmlFor="emailId"><b>Schedule Time :</b></CFormLabel><br/>
            <CFormLabel id="emailId">{orderData.timing}</CFormLabel>
          </CCol>
           <CCol md={4}>
            <CFormLabel htmlFor="statusId"><b>Status :</b></CFormLabel><br/>
            <CFormLabel id="statusId">{orderData.status}</CFormLabel>
           </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="emailId"><b>Tag : </b></CFormLabel><br/>
              <CFormLabel id="emailId">{orderData.tag}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="riderId"><b>Pickup Rider :</b></CFormLabel><br/>
              <CFormLabel id="riderId">{orderData && orderData.assigned_to ?
               ( <>
                 {orderData.assigned_to.split('#')[0]} {orderData.assigned_to.split('#')[1]}
                 </>) : (<> </>)}</CFormLabel>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId"><b>Delivery Date :</b></CFormLabel><br/>
              <CFormLabel id="deliveryDtId">{orderData && orderData.delivery_dt ?
                    format(orderData.delivery_dt, 'dd-MM-yyyy') : null}</CFormLabel>
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
              <CFormLabel htmlFor="deliveryChargesId"><b>Delivery charges (if any) :</b></CFormLabel><br/>
              <CFormInput type="text" name="deliveryCharges" id="deliveryChargesId" value={orderData.deliveryCharges}
                 onChange={handleStatusChange} />
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryRiderId"><b>Delivery Rider :</b></CFormLabel>
              <CFormSelect
                 aria-label="Default select example"
                 value={orderData.delivery_rider}
                 name="delivery_rider" id="deliveryRiderId"
                 onChange={handleStatusChange}
                 >
                 <option>Assign Rider</option>
                 {ridersData.map((item, index) => (
                    <option key={index} value={`${item.firstNameId}#${item.lastNameId}#${item.phoneNumberId}`}>
                    {item.firstNameId} {item.lastNameId}
                    </option>
                 ))}
              </CFormSelect>
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
                      <CTableDataCell>
                      {loggedInUser === '_sa1' ? (
                      <CFormInput
                        type="text"
                        id={`disc${index}`}
                        value={row.disc}
                        onChange={(e) => updateClothDetails(index, 'disc', e.target.value)}
                        />
                      ): row.disc}

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
           { loggedInUser === '_a1' || loggedInUser === '_sa1' ? (
           <CCol xs={12}>
              <CCardHeader>Payment Details</CCardHeader>
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
                        <CTableHeaderCell>&#8377; {orderData.total - orderData.payment_amount - orderData.short_fall - (orderData.advance_amt ? orderData.advance_amt : 0) }</CTableHeaderCell>
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
              {orderData.subscription && orderData.subscription == 'Y' ? (
                <PrintBillSubscription printData={orderData}/>
              ):(
                <PrintBill printData={orderData}/>
              )}
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

export default EditInvoice;

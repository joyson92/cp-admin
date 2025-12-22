import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'
import CIcon from '@coreui/icons-react';
import { cilTrash, cilPlus, cilCheck, cilArrowLeft } from '@coreui/icons';
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
  CFormSelect,
  CTableHeaderCell,
  CTable,
  CTableDataCell,
  CTableHead,
  CTableBody,
  CAlert,
  CFormSwitch
} from '@coreui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import Loader from './../Loader';
import AlertMessage from '../shared/AlertMessage';
import API from '../../services/apiService';


// Main Component
const EditOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [offers, setOffers] = useState([]);
  const [ridersData, setRidersData] = useState([]);
  const [custId, setCustId] = useState('');

  const [rows, setRows] = useState([{category: '', qty: '', type:'', sacCode:'', disc: '', price: 0, total:0}]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ msg: '', status: 'success', redirect: '' });
  const [submitState, setSubmitState] = useState(false);
  const [deliveryType, setDeliveryType] = useState(1);
  const [loading, setLoading] = useState(true);

  const loggedInUser = useSelector((state) => state.auth.loggedInUser?._t);

  useEffect(() => {
    calcTotal();
  }, [rows]);

  const addRow = () => {
    setRows([...rows, {category: '', qty: '', type:'', sacCode:'', disc: '', price: 0, total: 0}]);
  };

  const calcTotal = () => {
    let total = 0;
    let qty = 0;
    let subTotal = 0;
    let gst = 0;
    let disc = 0;
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

  const removeRow = (index) => {
    const updatedRows = [...rows];
    updatedRows.splice(index, 1);
    setRows(updatedRows);
  };

  const handleChange = (index, column, value) => {
    const updatedRows = [...rows];
    if(column == 'qty' && !updatedRows[index].hasOwnProperty('unit')) {
        updatedRows[index]['qty'] = value;
        updatedRows[index]['total'] = Math.round(updatedRows[index]['price'] * value * deliveryType);
        handleChange(index, 'disc', updatedRows[index]['disc']? updatedRows[index]['disc'] : 0);
    } else if(column == 'qty' && updatedRows[index].hasOwnProperty('unit')) {
        updatedRows[index]['qty'] = value;
    } else if(column == 'disc') {
        updatedRows[index]['disc'] = value;
        let qty = updatedRows[index]['qty'];
        if (updatedRows[index].hasOwnProperty('unit')) {
            qty = updatedRows[index]['unit'];
        }
        updatedRows[index]['total'] = Math.round(qty * (updatedRows[index]['price'] - (updatedRows[index]['price'] * (value / 100))) * deliveryType);
    } else if (column == 'unit') {
        updatedRows[index]['unit'] = value;
        updatedRows[index]['total'] = Math.round(updatedRows[index]['price'] * value * deliveryType);
    } else {
        const [category, price, type, sacCode, pricedAt] = value.split('#');
        updatedRows[index] = {category: '', qty: '', disc: '', total:0};
        updatedRows[index]['type'] = type;
        updatedRows[index]['sacCode'] = sacCode;
        updatedRows[index][column] = category;
        updatedRows[index]['price'] = price;
        updatedRows[index]['pricedAt'] = pricedAt
        if (pricedAt !== 'Item') {
          orderData['unitType'] = pricedAt;
          updatedRows[index]['unit'] = '';
        } else {
          orderData['unitType'] = '';
        }
//        updatedRows[index]['total'] = updatedRows[index]['qty'] * price * deliveryType;
    }
    setRows(updatedRows);
  };

  const handleStatusChange = (e) => {
      const { name, value } = e.target;
      setOrderData({ ...orderData, [name]: value });
      if (name == "deliveryType"){
         setDeliveryType(value == "Standard" ? 1 : 2);
      }
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

  const fetchPrices = async(e) => {
        const { name, value } = e.target;
        const response = await API.get('/pricing?type=' + value);
        if (response.status !== 200) {
           setAlertMsg({msg: 'Failed to fetch pricing list. Please contact administrator.', status: 'danger'});
           setShowAlert(true);
        }
        const parsedPricing = JSON.parse(response.data.body);
        setPricingData(parsedPricing);
        setOrderData({...orderData, ['type']: value})
        setRows([{category: '', type: '', sacCode:'', qty: '', disc: '', price: 0, total:0}]);
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
            setLoading(false);
            setSubmitState(true);
            setAlertMsg({msg: 'Failed to fetch order details. Please contact administrator.', status: 'danger'});
            setShowAlert(true);
          }
          const data = await response.json();
          const parsedData = JSON.parse(data.data);
          setOrderData(parsedData);

          const ridersResp = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/riders');
          if (!ridersResp.ok) {
            setLoading(false);
            setSubmitState(true);
            setAlertMsg({msg: 'Failed to fetch riders details. Please contact administrator.', status: 'danger'});
            setShowAlert(true);
          }
          const ridersData = await ridersResp.json();
          const parsedRiders = JSON.parse(ridersData.body);
          setRidersData(parsedRiders);
          if (parsedData && parsedData.cloth_details) {
              const pricingResp = await API.get('/pricing?type=' + parsedData.type);
              if (pricingResp.status !== 200) {
                setAlertMsg({msg: 'Failed to fetch pricing list. Please contact administrator.', status: 'danger'});
                setShowAlert(true);
                setSubmitState(true);
              }
              const parsedPricing = JSON.parse(pricingResp.data.body);
              setPricingData(parsedPricing);
              setDeliveryType(parsedData.deliveryType == "Standard" ? 1 : 2);
              setRows(parsedData.cloth_details);
              setCustId(parsedData.cust_id);
              setLoading(false);
          } else {
            setLoading(false);
          }
        } catch (error) {
          setAlertMsg({msg: 'Failure encountered. Please contact administrator.', status: 'danger'});
          setShowAlert(true);
          setLoading(false);
          setSubmitState(true);
        }
      };

      fetchData();
    }, []);

  useEffect(() => {
      if(custId && pricingData.length > 0) {
        const fetchOffers = async () => {
            const value = orderData['type'];
            const offersResp = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/offers?type=' + value + '&custId='+custId);
            const offersData = await offersResp.json();
            const offer = JSON.parse(offersData.body);
            setOffers(offer);
        };
        fetchOffers();
      }
  }, [custId, pricingData]);


  const handleSubmit = async(event) => {
      event.preventDefault()
      setSubmitState(true);
      const formData = new FormData(event.target);

      formData.forEach((value, key) => {
        orderData[key] = value;
      });
      orderData['cloth_details'] = rows;
      if(orderData.offer != "") {
         const splitter = orderData.offer.split("#");
         if (splitter[1] == 'Y'){
            orderData.subscribed = 'Y'
         }
      }
      try {
            const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/orders/update', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData)
            });

            if (!response.ok) {
              setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
              setSubmitState(false);
            } else {
                const resp = await response.json();
                const parsedResp = JSON.parse(resp.data);
                setAlertMsg({msg: parsedResp['message'], status: 'success', redirect: '/orders'});
            }
          } catch (error) {
            setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
            console.error('There was an error with the POST request:', error);
          }
          setShowAlert(true);
    }

    const executeOffer = async () => {
        const jsonObj = {};
        jsonObj['cloth_details'] = rows;
        jsonObj['cust_id'] = custId;
        jsonObj['type'] = orderData['type'];
        jsonObj['offer'] = orderData['offer'];
            try {
                const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/offers/execute', {
                   method: 'POST',
                   headers: {
                     'Content-Type': 'application/json',
                   },
                   body: JSON.stringify(jsonObj)
                });
                if (!response.ok) {
                   setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
                } else {
                   const data = await response.json();
                   const parsedData = JSON.parse(data.body);
                   setRows(parsedData.cloth_details);
                   setAlertMsg({msg: parsedData['message'], status: parsedData['status']});
                }
            } catch (error) {
                setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
                console.error('Error fetching data:', error);
            }
            setShowAlert(true);
    };

  return (
  <CRow>
        <AlertMessage
          show={showAlert}
          setShow={setShowAlert}
          message={alertMsg.msg}
          status={alertMsg.status}
          duration={5000}
          redirectTo={alertMsg.redirect}
        />
       <> {loading ? ( <Loader /> ): ''} </>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
            <CIcon icon={cilArrowLeft} style={{cursor: 'pointer', marginRight: '10px', marginTop: '5px'}} title='Back' onClick={() => {navigate(-1)}}/>
              <strong>Order Details - {orderData.order_id}-{orderData.no_of_orders}</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          onSubmit={handleSubmit}
        >

        <CCol md={4}>
           <CFormLabel htmlFor="orderDateId"><b>Order Date:</b></CFormLabel>
           <CFormInput type="text" id="orderDateId"
             value={orderData && orderData.order_dt ?
                                  format(orderData.order_dt, 'dd-MM-yyyy')
                                     : null}
             />
        </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="firstNameId"><b>Customer Name:</b></CFormLabel>
            <CFormInput type="text" name="contact_person" id="firstNameId" value={orderData.contact_person}
            onChange={handleStatusChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="phoneNumberId"><b>Phone Number ({orderData.whatsapp_number ? orderData.whatsapp_number : ''}):</b></CFormLabel>
            <CFormInput type="text" name="contact_number" id="phoneNumberId" value={orderData.contact_number}
              onChange={handleStatusChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId"><b>Address:</b></CFormLabel>
            <CFormInput type="text" name="address" id="addressId" value={orderData.address}
            onChange={handleStatusChange} />
          </CCol>

          <CCol md={4}>
            <CFormLabel htmlFor="emailId"><b>Schedule Time ({orderData.scheduled_for ? orderData.scheduled_for.split("-")[0]: ''}):</b></CFormLabel>
            <CFormInput type="text" name="timing" id="emailId" value={orderData.timing}
            onChange={handleStatusChange} />
          </CCol>
           <CCol md={4}>
            <CFormLabel htmlFor="statusId"><b>Status:</b></CFormLabel>
            <CFormSelect
              aria-label="Default select example"
              value={orderData.status}
              name="status" id="statusId"
              onChange={handleStatusChange}
              options={[
                { label: 'Booked', value: 'Booked'},
                { label: 'In-Progress', value: 'In-Progress' },
                { label: 'Delivery-Ready', value: 'Delivery Ready' },
                { label: 'Out-For-Delivery', value: 'Out for Delivery' },
                { label: 'Completed', value: 'Completed'},
                { label: 'Cancelled', value: 'Cancelled'}
              ]}
            />
           </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="emailId"><b>Tag:</b></CFormLabel>
              <CFormInput type="text" name="tag" id="emailId" value={orderData.tag}
              onChange={handleStatusChange}/>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="riderId"><b>Rider:</b></CFormLabel>
              <CFormSelect
                 aria-label="Default select example"
                 value={orderData.assigned_to}
                 name="assigned_to" id="riderId"
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
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId"><b>Pickup/Dropped Date:</b></CFormLabel>
                 <DatePicker
                    selected={orderData.pickup_dt}
                    onChange={(date) => setOrderData({...orderData, pickup_dt: format(date, 'yyyy-MM-dd')})}
                    dateFormat="dd-MM-yyyy"
                    placeholderText="Select date"
                    className="form-control"
                    />
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="deliveryDtId"><b>Delivery Date:</b></CFormLabel>
              <DatePicker
                  selected={orderData.delivery_dt}
                  onChange={(date) => setOrderData({...orderData, delivery_dt: format(date, 'yyyy-MM-dd')})}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select date"
                  className="form-control"
                />
           </CCol>
           <CCol md={4}>
                       <CFormLabel htmlFor="deliveryTypeId"><b>Delivery Type:</b></CFormLabel>
                       <CFormSelect
                         aria-label="Default select example"
                         value={orderData.deliveryType}
                         name="deliveryType" id="deliveryTypeId"
                         onChange={handleStatusChange}
                         options={[
                           { label: 'Standard', value: 'Standard'},
                           { label: 'Express', value: 'Express' }
                         ]}
                       />
           </CCol>
           <CCol md={4}>
                         <CFormLabel htmlFor="dueDtId"><b>Due Date:</b></CFormLabel>
                         <DatePicker
                             selected={orderData.due_dt}
                             onChange={(date) => setOrderData({...orderData, due_dt: format(date, 'yyyy-MM-dd')})}
                             dateFormat="dd-MM-yyyy"
                             placeholderText="Select date"
                             className="form-control"
                           />

           </CCol>
           <CCol md={4}>
               <CFormLabel htmlFor="typeId"><b>Process Type:</b></CFormLabel>
               <CFormSelect
                   aria-label="Default select example"
                   value={orderData.type}
                   name="type" id="typeId"
                   onChange={fetchPrices}
                   options={[
                   'Please select',
                   { label: 'Dry Cleaning', value: 'Dry Cleaning'},
                   { label: 'Laundry', value: 'Laundry' },
                   { label: 'Laundry W&P', value: 'Laundry WP' },
                   { label: 'Laundry W&F', value: 'Laundry WF' },
                   { label: 'Steam Press', value: 'Steam Press' },
                   { label: 'Shoes & Bags', value: 'Shoes & Bags' },
                   { label: 'Home Care', value: 'Home Care' },
                   ]}
               />
           </CCol>
           {loggedInUser === '_sa1' || loggedInUser === '_a1' ? (
           <CCol md={4}>
               <CFormLabel htmlFor="branchId"><b>Branch:</b></CFormLabel>
               <CFormSelect
                   aria-label="Select branch"
                   value={orderData.branch}
                   name="branch" id="branchId"
                   onChange={handleStatusChange}
                   options={[
                   { label: 'Goregaon', value: 'Goregaon'},
                   { label: 'Versova', value: 'Versova' },
                   { label: 'Juhu', value: 'Juhu'}
                   ]}
               />
           </CCol>
           ): ''}

           <CCol md={4}>
               <CFormLabel htmlFor="deliveryChargesId"><b>Delivery charges (if any) :</b></CFormLabel><br/>
               <CFormInput type="text" name="deliveryCharges" id="deliveryChargesId" value={orderData.deliveryCharges}
                  onChange={handleStatusChange} />
           </CCol>

           <CCol md={4}>
               <CFormSwitch label="Notify Customer?" checked={!orderData.order_booked_notified}
                   onChange={(e) => setOrderData({...orderData, order_booked_notified: !e.target.checked})} />
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
                      <CTableHeaderCell>Total</CTableHeaderCell>
                      <CTableDataCell>
                        <CButton color="primary" onClick={addRow}>
                          <CIcon icon={cilPlus} className="float-end" width={16} />
                        </CButton>
                      </CTableDataCell>
                   </CTableRow>
                </CTableHead>
                <CTableBody>
                   {rows.map((row, index) => (
                   <CTableRow key={index}>
                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                      <CTableDataCell>
                        <CFormSelect
                          aria-label="Default select example"
                          id={`category${index}`}
                          value={`${row.category}#${row.price}#${row.type}#${row.sacCode}#${row.pricedAt}`}
                          onChange={(e) => handleChange(index, 'category', e.target.value)}
                          >
                            <option>Select Category</option>
                            {pricingData.map((item, index) => (
                              <option key={index} value={`${item.category}#${item.price}#${item.type}#${item.pricedAt}`}>
                                {item.category}
                              </option>
                            ))}
                        </CFormSelect>
                      </CTableDataCell>
                      <CTableDataCell>{row.price * deliveryType} </CTableDataCell>
                      <CTableDataCell>
                        <CFormInput
                          type="text"
                          id={`qty${index}`}
                          value={row.qty}

                          onChange={(e) => handleChange(index, 'qty', e.target.value)}
                          />
                      </CTableDataCell>
                       <CTableDataCell>
                           {row.unit !== undefined ?
                           <CFormInput
                              type="text"
                              id={`unit${index}`}
                              value={row.unit}
                              onChange={(e) => handleChange(index, 'unit', e.target.value)}
                              />
                           : null}
                       </CTableDataCell>

                      <CTableDataCell>
                         <CFormInput
                            type="text"
                            id={`disc${index}`}
                            value={row.disc}
                            onChange={(e) => handleChange(index, 'disc', e.target.value)}
                         />
                      </CTableDataCell>
                      <CTableDataCell>
                        {row.total}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton color="danger" onClick={() => removeRow(index)}>
                          <CIcon icon={cilTrash} className="float-end" width={16} />
                        </CButton>
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
                      <CTableDataCell></CTableDataCell>
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
                       <CTableDataCell>&#8377;{orderData.total}</CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                   </CTableRow>
                </CTableBody>
              </CTable>
           </CCardBody>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="typeId">Available Offers:</CFormLabel>
              <CFormSelect
                 aria-label="Default select example"
                 value={orderData.offer}
                 onChange={handleStatusChange}
                 name="offer" id="offerId">
                 <option value="">Select Offer</option>
                    {offers.map((item, index) => {
                       if (item.plan) {
                          return (
                            <option key={index} value={`${item.plan}#Y`}>
                               {item.plan}
                            </option>
                       )} else {
                          return (
                             <option key={index} value={`${item.offer_name}#N`}>
                              {item.offer_name}
                             </option>
                       );}})}
             </CFormSelect>
             <CIcon
                icon={cilCheck}
                size="lg"
                onClick={executeOffer}
                style={{ cursor: 'pointer', color: 'green' }}
                title="Apply Offer"
             />
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

export default EditOrder;

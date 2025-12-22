import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
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
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CTableRow,
  CFormSelect,
  CTableHeaderCell,
  CTable,
  CTableDataCell,
  CTableHead,
  CTableBody,
  CAlert,
  CFormFeedback,
  CFormSwitch
} from '@coreui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import API from '../../services/apiService';


// Main Component
const AddOrder = () => {
  const navigate = useNavigate();
  const branch = useSelector((state) => state.auth.loggedInUser?.loc);

  const [orderData, setOrderData] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [offers, setOffers] = useState([]);
  const [ridersData, setRidersData] = useState([]);
  const [custId, setCustId] = useState('');

  const [rows, setRows] = useState([{category: '', qty: '', type:'', sacCode:'', disc: '', price: 0, total:0}]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const [deliveryType, setDeliveryType] = useState(1);

  const [query, setQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    calcTotal();
  }, [rows]);

  useEffect(() => {
    if(showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
        setSubmitState(false);
        navigate('/orders');
      }, 5000); // Adjust the duration (in milliseconds) as needed

      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [showAlert]);

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
      if(column === 'qty' && !updatedRows[index].hasOwnProperty('unit')) {
          updatedRows[index]['qty'] = value;
          updatedRows[index]['total'] = Math.round(updatedRows[index]['price'] * value * deliveryType);
          handleChange(index, 'disc', updatedRows[index]['disc']? updatedRows[index]['disc'] : 0);
      } else if(column === 'qty' && updatedRows[index].hasOwnProperty('unit')) {
          updatedRows[index]['qty'] = value;
      } else if(column === 'disc') {
          updatedRows[index]['disc'] = value;
          let qty = updatedRows[index]['qty'];
          if (updatedRows[index].hasOwnProperty('unit')) {
             qty = updatedRows[index]['unit'];
          }
          updatedRows[index]['total'] = Math.round(qty * (updatedRows[index]['price'] - (updatedRows[index]['price'] * (value / 100))) * deliveryType);
      } else if (column === 'unit') {
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
          if (pricedAt !== 'Item' && pricedAt !== 'Subscription') {
            orderData['unitType'] = pricedAt;
            updatedRows[index]['unit'] = '';
          } else if (pricedAt === 'Subscription') {
            if(updatedRows.length > 1) {
                alert("Cannot add subscription plan along with other items");
                return;
            }
            orderData['subscription'] = 'Y';
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
      if (name === "deliveryType"){
        setDeliveryType(value === "Standard" ? 1 : 2);
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


  useEffect(() => {
      const fetchData = async () => {
        try {
          const ridersResp = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/riders');
          if (!ridersResp.ok) {
            throw new Error('Failed to fetch data');
          }
          const ridersData = await ridersResp.json();
          const parsedRiders = JSON.parse(ridersData.body);
          setRidersData(parsedRiders);
        } catch (error) {
          console.error('Error fetching data:', error);
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
      const form = event.currentTarget;
      event.preventDefault();
      if (form.checkValidity() === false) {
        event.stopPropagation()
        setValidated(true)
      } else {
      setSubmitState(true);
      const formData = new FormData(event.target);
      formData.forEach((value, key) => {
        orderData[key] = value;
      });
      orderData['cloth_details'] = rows;
      orderData.branch = branch;

      if(orderData.offer !== "") {
        const splitter = orderData.offer.split("#");
        if (splitter[1] === 'Y'){
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
              setShowAlert(true);
              setSubmitState(false);
            } else {
                const resp = await response.json();
                const parsedResp = JSON.parse(resp.data);
                setAlertMsg({msg: parsedResp['message'], status: 'success'});
                setShowAlert(true);
            }
          } catch (error) {
            console.error('There was an error with the POST request:', error);
          }
      }
    }

    const handleAutoSuggestion = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.trim() && value.length > 0) {
          const customers = localStorage.getItem('cust');
          const customerArray = customers ? JSON.parse(customers) : [];
          setSuggestions(customerArray);

          const filtered = suggestions.filter((suggestion) =>
              suggestion.customer_name.toLowerCase().includes(value.toLowerCase()) ||
              suggestion.cust_id.toLowerCase().includes(value.toLowerCase()));
          setFilteredSuggestions(filtered);
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }

    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.customer_name);
        setShowSuggestions(false);
        const fetchData = async () => {
            try {
                const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/customers?cust='+suggestion.cust_id);
                if (!response.ok) {
                   setAlertMsg({msg: 'Failed to receive network response.', status: 'danger'});
                   setShowAlert(true);
                } else {
                   const data = await response.json();
                   const parsedData = JSON.parse(data.body);
                   setOrderData((prevOrderData) => {
                     const updatedOrderData = {
                       ...prevOrderData,
                       contact_number: parsedData.primary_number,
                       address: parsedData.address,
                       cust_id: parsedData.cust_id,
                       billed: parsedData.billed,
                     };

                     if (parsedData?.gst !== undefined) {
                       updatedOrderData.customerGST = parsedData.gst;
                     } else {
                       delete updatedOrderData.customerGST;
                     }
                     return updatedOrderData;
                   });
                   setCustId(parsedData.cust_id);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    };

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
                   setShowAlert(true);
                } else {
                   const data = await response.json();
                   const parsedData = JSON.parse(data.body);
                   setRows(parsedData.cloth_details);
                   setAlertMsg({msg: parsedData['message'], status: 'success'});
                   setShowAlert(true);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
    };

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
            <CIcon icon={cilArrowLeft} style={{cursor: 'pointer', marginRight: '10px', marginTop: '5px'}} title='Back' onClick={() => {navigate(-1)}}/>
              <strong>Order Details</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >

        <CCol md={4}>
           <CFormLabel htmlFor="orderDateId"><b>Order Date:</b></CFormLabel>
           <DatePicker
              selected={orderData.order_dt}
              onChange={(date) => setOrderData({...orderData, order_dt: format(date, 'yyyy-MM-dd')})}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select date"
              autoComplete="off"
              className="form-control"
              required
              />
           <CFormFeedback invalid>Please enter order date.</CFormFeedback>
        </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="firstNameId"><b>Customer Name:</b></CFormLabel>
            <CFormInput type="text" name="contact_person" id="firstNameId" value={query}
            onChange={handleAutoSuggestion} placeholder="Start typing..."
            autoComplete="off" required/>
            {showSuggestions && (
                    <CDropdown className="d-block" visible={showSuggestions}>
                      <CDropdownMenu>
                        {filteredSuggestions.length > 0 ? (
                          filteredSuggestions.map((suggestion, index) => (
                            <CDropdownItem key={index} onClick={() => handleSuggestionClick(suggestion)}>
                              {suggestion.customer_name}
                            </CDropdownItem>
                          ))
                        ) : (
                          <CDropdownItem disabled>Customer not found</CDropdownItem>
                        )}
                      </CDropdownMenu>
                    </CDropdown>
                  )}
            <CFormFeedback invalid>Please enter customer name.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="phoneNumberId"><b>Phone Number:</b></CFormLabel>
            <CFormInput type="text" name="contact_number" id="phoneNumberId" value={orderData.contact_number}
            onChange={handleStatusChange} autoComplete="off" required/>
            <CFormFeedback invalid>Please enter phone number.</CFormFeedback>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId"><b>Address:</b></CFormLabel>
            <CFormInput type="text" name="address" id="addressId" value={orderData.address}
            onChange={handleStatusChange} autoComplete="off" required/>
            <CFormFeedback invalid>Please enter address.</CFormFeedback>
          </CCol>
          
          <CCol md={4}>
            <CFormLabel htmlFor="scheduleTimeId"><b>Schedule Time:</b></CFormLabel>
            <CFormSelect
                          aria-label="Default select example"
                          value={orderData.timing}
                          name="timing" id="scheduleTimeId"
                          onChange={handleStatusChange}
                          options={[
                            'Please select timing',
                            { label: '10:00am-01:00pm', value: '10:00am-01:00pm'},
                            { label: '01:00pm-05:00pm', value: '01:00pm-05:00pm' },
                            { label: '05:00pm-08:00pm', value: '05:00pm-08:00pm'}
                          ]}
                        />

          </CCol>
           <CCol md={4}>
            <div className="d-flex align-items-center">
              <CFormLabel htmlFor="statusId" className="me-2"><b>Status:</b></CFormLabel>
             
            </div>
            <CFormSelect
              aria-label="Default select example"
              value={orderData.status}
              name="status" id="statusId"
              onChange={handleStatusChange}
              options={[
                { label: 'Booked', value: 'Booked'},
                { label: 'In-Progress', value: 'In-Progress' },
                { label: 'Completed', value: 'Completed'}
              ]}
            />
           </CCol>
            <CCol md={4}>
              <CFormLabel htmlFor="emailId"><b>Tag:</b></CFormLabel>
              <CFormInput type="text" name="tag" id="emailId" value={orderData.tag}/>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="riderId"><b>Rider:</b></CFormLabel>
              <CFormSelect
                 aria-label="Default select example"
                 value={orderData.assigned_to}
                 name="assigned_to" id="riderId"
                 onChange={handleStatusChange}
              >
                 <option value="">Assign Rider</option>
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
                 required
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
                  required
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
              <CFormLabel htmlFor="dueDtId"><b>Due Date: </b></CFormLabel>
              <DatePicker
                 selected={orderData.due_dt}
                 onChange={(date) => setOrderData({...orderData, due_dt: format(date, 'yyyy-MM-dd')})}
                 dateFormat="dd-MM-yyyy"
                 placeholderText="Select date"
                 className="form-control"
                 required
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
           <CCol md={4}>
               <CFormLabel htmlFor="deliveryChargesId"><b>Delivery charges (if any) :</b></CFormLabel><br/>
               <CFormInput type="text" name="deliveryCharges" id="deliveryChargesId" value={orderData.deliveryCharges}
                  onChange={handleStatusChange} />
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
                      {orderData && orderData.unitType !== '' ?
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
                      <CTableDataCell>{row.price * deliveryType}</CTableDataCell>
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

export default AddOrder;

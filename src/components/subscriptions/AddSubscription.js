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
  CTableRow,
  CFormSelect,
  CTableHeaderCell,
  CTable,
  CTableDataCell,
  CTableHead,
  CTableBody,
  CAlert,
  CFormFeedback
} from '@coreui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInDays } from 'date-fns';


// Main Component
const AddSubscription = () => {
  const location = useLocation();
  const [orderData, setOrderData] = useState([]);
  const [pricingData, setPricingData] = useState([]);
  const [subscribedDays, setSubscribedDays] = useState(0);

  const [custId, setCustId] = useState('');

  const [rows, setRows] = useState([{category: '', qty: '', type:'', sacCode:'', disc: '', price: 0, total:0}]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);


  const [query, setQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    calcTotal();
  }, [rows]);

  useEffect(() => {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000); // Adjust the duration (in milliseconds) as needed

      return () => clearTimeout(timer); // Cleanup timer on component unmount
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
    rows.forEach((row) => {
        subTotal += parseFloat(row.total) || 0;
        qty += parseFloat(row.qty) || 0;
    });
    gst = parseFloat((subTotal * 18 / 100).toFixed(2));
    total = Math.round(subTotal + gst);
    setOrderData({ ...orderData, ['qty']: qty, ['subTotal']: subTotal, ['total']: total, ['gst']: gst });
  }


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
          updatedRows[index]['pricedAt'] = pricedAt;
          orderData['subscription'] = 'Y';
      }
      setRows(updatedRows);
    };

  const handleStatusChange = (e) => {
      const { name, value } = e.target;
      setOrderData({ ...orderData, [name]: value });
  };

  const fetchPrices = async(e) => {
          const { name, value } = e.target;
          const pricingResp = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/pricing?sub=' + value);
          if (!pricingResp.ok) {
  //           throw new Error('Failed to fetch data');
          }
          const priceData = await pricingResp.json();
          const parsedPricing = JSON.parse(priceData.body);
          setPricingData(parsedPricing);
          setOrderData({...orderData, ['type']: value})
          setRows([{category: '', type: '', sacCode:'', qty: '', disc: '', price: 0, total:0}]);
  };


  const handleSubmit = async(event) => {
      const form = event.currentTarget
      if (form.checkValidity() === false) {
        event.preventDefault()
        event.stopPropagation()
        setValidated(true)
      } else {
      event.preventDefault()
      setSubmitState(true);
      const formData = new FormData(event.target);
      formData.forEach((value, key) => {
        orderData[key] = value;
      });
      orderData['cloth_details'] = rows;

      try {
            const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/subscriptions/add', {
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
                setSubmitState(false);
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
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Subscription</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
        >

        <CCol md={4}>
           <CFormLabel htmlFor="orderDateId"><b>Invoice Date:</b> </CFormLabel>
           <DatePicker
              selected={orderData.invoice_dt}
              onChange={(date) => setOrderData({...orderData, invoice_dt: format(date, 'yyyy-MM-dd')})}
              dateFormat="dd-MM-yyyy"
              placeholderText="Select date"
              autoComplete="off"
              className="form-control"
              required
              />
           <CFormFeedback invalid>Please enter invoice date</CFormFeedback>
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
            <CFormFeedback invalid>Please enter customer name</CFormFeedback>
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
              <CFormLabel htmlFor="startDtId"><b>Start Date:</b></CFormLabel>
              <DatePicker
                 selected={orderData.start_dt}
                 onChange={(date) => setOrderData({...orderData, start_dt: format(date, 'yyyy-MM-dd')})}
                 dateFormat="dd-MM-yyyy"
                 placeholderText="Select date"
                 className="form-control"
                 required
                 />
              <CFormFeedback invalid>Please enter start date</CFormFeedback>
           </CCol>
           <CCol md={4}>
              <CFormLabel htmlFor="endDtId"><b>End Date:</b></CFormLabel>
              <DatePicker
                  selected={orderData.end_dt}
                  onChange={(date) => setOrderData({...orderData, end_dt: format(date, 'yyyy-MM-dd')})}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Select date"
                  className="form-control"
                  required
                />
              <CFormFeedback invalid>Please enter end date</CFormFeedback>
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
                required
             />
             <CFormFeedback invalid>Please select process type</CFormFeedback>
           </CCol>

            <CCol md={4}>
              <CFormLabel htmlFor="subscribedDaysId"><b>Subscribed Days:</b></CFormLabel>
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
                      {orderData && orderData.unitType !== '' ?
                         <CTableHeaderCell>{orderData.unitType}</CTableHeaderCell>
                      : <CTableHeaderCell></CTableHeaderCell>}
                      <CTableHeaderCell>Disc.</CTableHeaderCell>
                      <CTableHeaderCell>Total</CTableHeaderCell>

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
                      <CTableDataCell>{row.price}</CTableDataCell>
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
                      <CTableDataCell>{orderData.subTotal}</CTableDataCell>
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
                       <CTableDataCell>{orderData.gst}</CTableDataCell>
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
                       <CTableDataCell>{orderData.total}</CTableDataCell>
                       <CTableDataCell></CTableDataCell>
                   </CTableRow>
                </CTableBody>
              </CTable>
           </CCardBody>
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

export default AddSubscription;

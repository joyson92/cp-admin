import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilPen, cilNotes, cilArrowLeft } from '@coreui/icons';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CButton,
  CFormSelect,
  CAlert,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
  CFormInput
} from '@coreui/react';
import Loader from './../Loader';
import { format } from 'date-fns';
import API from '../../services/apiService';

// Main Component
const ViewCustomer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [submitState, setSubmitState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState(false);
  const [activeKey, setActiveKey] = useState(1);

  const handleSubmit = async(event) => {
      event.preventDefault()
      setSubmitState(true);
      setLoading(true);
      const formData = new FormData(event.target);
      const formObj = {};
      formData.forEach((value, key) => {
        tableData[key] = value;
      });
      try {
            const response = await API.post('/customers/update', tableData);
            if (response.status !== 200) {
               setAlertMsg({msg: 'Failed to customer details.', status: 'danger'});
               setShowAlert(true);
               setSubmitState(false);
               setLoading(false);
            } else {
               const parsedResp = JSON.parse(response.data.body);
               setLoading(false);
               setAlertMsg({msg: parsedResp['message'], status: 'success'});
               setShowAlert(true);
               setSubmitState(false);

            }

          } catch (error) {
            // Handle errors here
            console.error('There was an error with the POST request:', error);
            setLoading(false);
          }
    }

    useEffect(() => {
           const timer = setTimeout(() => {
             setShowAlert(false);
           }, 5000);

           return () => clearTimeout(timer);
        }, [showAlert]);

    const handleStatusChange = (e) => {
      const { name, value } = e.target;
      setTableData({ ...tableData, [name]: value });
      if (value == "Monthly") {
        setBillingCycle(true);
      } else if(value == "Regular") {
        setBillingCycle(false);
      }
    };

    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    useEffect(() => {
          const fetchData = async () => {
            try {
              const response = await API.get(`/customers?id=${id}`);
              if (response.status !== 200) {
                setLoading(false);
                 setAlertMsg({msg: 'Failed to customer details. Please contact Administrator.', status: 'danger'});
                 setShowAlert(true);
              } else {
                 const parsedData = JSON.parse(response.data.body);
                 setTableData(parsedData.cust);
                 setInvoices(parsedData.invoices);
                 setOrders(parsedData.orders);
                 setLoading(false);
              }
            } catch (error) {
              console.error('Error fetching data:', error);
              setLoading(false);
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
            <CIcon icon={cilArrowLeft} style={{cursor: 'pointer', marginRight: '10px', marginTop: '5px'}} title='Back' onClick={() => {navigate(-1)}}/>
              <strong>Customer Details - {tableData.cust_id}</strong>
            </CCardHeader>
            <CCardBody>
    <CForm
          className="row g-3 needs-validation"
          onSubmit={handleSubmit}
        >
          <CCol md={4}>
            <CFormLabel htmlFor="customerNameId"><b>Customer Name :</b></CFormLabel>&nbsp;
            <CFormInput type="text" name="customer_name" id="customerNameId" value={tableData.customer_name}
               onChange={handleStatusChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="contactMobileId"><b>Contact Number :</b></CFormLabel>&nbsp;
            <CFormInput type="text" name="primary_number" id="contactMobileId" value={tableData.primary_number}
               onChange={handleStatusChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId"><b>Address :</b></CFormLabel>&nbsp;
            <CFormInput type="text" name="address" id="addressId" value={tableData.address}
               onChange={handleStatusChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="gstId"><b>GST # :</b></CFormLabel>&nbsp;
            <CFormInput type="text" name="gst" id="gstId" value={tableData.gst}
               onChange={handleStatusChange} />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="billedId"><b>Billed :</b></CFormLabel>&nbsp;
            <CFormSelect
               aria-label="Default select example"
               name="billed" id="billedId"
               value={tableData.billed}
               onChange={handleStatusChange}
               options={[
                  'Please select',
                  { label: 'Regular', value: 'Regular'},
//                  { label: 'Weekly', value: 'Weekly' },
//                  { label: 'Bi-Weekly', value: 'Bi-Weekly'},
                  { label: 'Monthly', value: 'Monthly'}
               ]}
            />
          </CCol>
          {billingCycle || tableData.billing_cycle ? (
          <CCol md={4}>
            <CFormLabel htmlFor="billingCycleId"><b>Billing Cycle :</b></CFormLabel>&nbsp;
            <CFormSelect
               aria-label="Default select example"
               name="billingCycle" id="billingCycleId"
               value={tableData.billing_cycle}
               onChange={handleStatusChange}>

                {Array.from({ length: 28 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
            </CFormSelect>
          </CCol>
          ): null}
          <CCol md={4}>
            <CFormLabel htmlFor="priorityId"><b>Priority :</b></CFormLabel>&nbsp;
            <CFormSelect
                   aria-label="Default select example"
                   name="priority" id="priorityId"
                   value={tableData.priority}
                   onChange={handleStatusChange}
                   options={[
                      'Please select',
                      { label: 'Low', value: 'Low'},
                      { label: 'Medium', value: 'Medium' },
                      { label: 'High', value: 'High'},
                      { label: 'Highest', value: 'Highest'}
                   ]}
                />

          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="customerSpecificId"><b>Customer Specific Offer:</b></CFormLabel>
            <CFormSelect
              aria-label="Default select example"
              name="customerSpecificOffer" id="customerSpecificId"
              value={tableData.customerSpecificOffer}
              onChange={handleStatusChange}
              options={[
                'Please select',
                { label: 'FLAT550OFF', value: 'FLAT550OFF'},
                { label: 'OFF10P', value: 'OFF10P' },
                { label: 'FREEPICKDELIVERY', value: 'FREEPICKDELIVERY'}
              ]}
              />
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId"><b>Wallet :</b></CFormLabel>&nbsp;
            <CFormLabel id="addressId">{tableData.wallet_balance}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId"><b>Pending Order (&#8377;):</b></CFormLabel>&nbsp;
            <CFormLabel id="addressId">{tableData.ord_amt}</CFormLabel>
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="addressId"><b>Pending Invoice (&#8377;):</b></CFormLabel>&nbsp;
            <CFormLabel id="addressId">{tableData.inv_pending}</CFormLabel>
          </CCol>

<CNav variant="tabs" role="tablist">
        <CNavItem>
          <CNavLink active={activeKey === 1} onClick={() => setActiveKey(1)}>
            Orders
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeKey === 2} onClick={() => setActiveKey(2)}>
            Invoices
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeKey === 3} onClick={() => setActiveKey(3)}>
            Wallet Transactions
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane visible={activeKey === 1}>
<CTable className="table-font" hover>
                           <CTableHead>
                             <CTableRow>
                               <CTableHeaderCell scope="col">#</CTableHeaderCell>
                               <CTableHeaderCell>Order #</CTableHeaderCell>
                               <CTableHeaderCell>Order Date</CTableHeaderCell>
                               <CTableHeaderCell>Delivery Date</CTableHeaderCell>
                               <CTableHeaderCell>Order (&#8377;)</CTableHeaderCell>
                               <CTableHeaderCell>Status</CTableHeaderCell>
                               <CTableHeaderCell></CTableHeaderCell>
                             </CTableRow>
                           </CTableHead>
                           <CTableBody>
                             {Array.isArray(orders) && orders.length > 0 ? (
                                           orders.map((item, index) => (
                                             <CTableRow>
                                               <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                               <CTableDataCell>{item.order_id}-{item.no_of_orders}</CTableDataCell>
                                               <CTableDataCell>{format(item.order_dt, 'dd-MM-yyyy')}</CTableDataCell>
                                               <CTableDataCell>{item.delivery_dt ? format(item.delivery_dt, 'dd-MM-yyyy'): null}</CTableDataCell>
                                               <CTableDataCell>{item.total}</CTableDataCell>
                                               <CTableDataCell>{item.status}</CTableDataCell>
                                               <CTableDataCell>
                                               {item.status == 'In-Progress' ? (
                                                <Link
                                                    className="font-weight-bold font-xs text-body-secondary"
                                                    to={{
                                                        pathname: "/orders/editOrder",
                                                        search: `?id=${item.order_id}&orderNo=${item.no_of_orders}`
                                                    }}>
                                                      <CIcon icon={cilPen} className="float-end" width={16} title="Edit Order" />
                                                </Link>
                                                ) : (
                                                <Link
                                                    className="font-weight-bold font-xs text-body-secondary"
                                                    to={{
                                                        pathname: "/orders/viewOrder",
                                                        search: `?id=${item.order_id}&orderNo=${item.no_of_orders}`
                                                    }}>
                                                       <CIcon icon={cilNotes} className="float-end" width={16} title="View Order"/>
                                                </Link>
                                                )}
                                               </CTableDataCell>
                                             </CTableRow>
                                           ))
                                         ) : (
                                           <CTableRow>
                                             <CTableDataCell colSpan={8}>No data available</CTableDataCell>
                                           </CTableRow>
                                         )}
                           </CTableBody>
                         </CTable>
        </CTabPane>
        <CTabPane visible={activeKey === 2}>
         <CTable className="table-font" hover>
                           <CTableHead>
                             <CTableRow>
                               <CTableHeaderCell scope="col">#</CTableHeaderCell>
                               <CTableHeaderCell>Order #</CTableHeaderCell>
                               <CTableHeaderCell>Invoice #</CTableHeaderCell>
                               <CTableHeaderCell>Invoice Date</CTableHeaderCell>
                               <CTableHeaderCell>Base (&#8377;)</CTableHeaderCell>
                               <CTableHeaderCell>Discount (&#8377;)</CTableHeaderCell>
                               <CTableHeaderCell>Invoice (&#8377;)</CTableHeaderCell>
                               <CTableHeaderCell>Payment (&#8377;)</CTableHeaderCell>
                               <CTableHeaderCell>Pending (&#8377;)</CTableHeaderCell>
                               <CTableHeaderCell>Shortfall (&#8377;)</CTableHeaderCell>
                               <CTableHeaderCell>Payment Status</CTableHeaderCell>
                               <CTableHeaderCell></CTableHeaderCell>
                             </CTableRow>
                           </CTableHead>
                           <CTableBody>
                             {Array.isArray(invoices) && invoices.length > 0 ? (
                                           invoices.map((item, index) => (
                                             <CTableRow>
                                               <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                               <CTableDataCell>{item.order_id}-{item.no_of_orders}</CTableDataCell>
                                               <CTableDataCell>{item.invoice_id}</CTableDataCell>
                                               <CTableDataCell>{format(item.invoice_dt, 'dd-MM-yyyy')}</CTableDataCell>
                                               <CTableDataCell>{item.base}</CTableDataCell>
                                               <CTableDataCell>{item.disc}</CTableDataCell>
                                               <CTableDataCell>{item.total}</CTableDataCell>
                                               <CTableDataCell>{item.pmt_total}</CTableDataCell>
                                               <CTableDataCell>{item.pending}</CTableDataCell>
                                               <CTableDataCell>{item.sf} </CTableDataCell>
                                               <CTableDataCell>{item.payment_status}</CTableDataCell>
                                               <CTableDataCell>
                                               {item.payment_status == 'Pending' ?
                                                item.order_id === 'B' ? (
                                                                                                <Link
                                                                                                className="font-weight-bold font-xs text-body-secondary"
                                                                                                to={{
                                                                                                    pathname: "/editInvoiceBulk",
                                                                                                    search: `?id=${item.invoice_id}&oid=${item.order_id}`
                                                                                                }}>
                                                                                                  <CIcon icon={cilPen} className="float-end" title="Edit Invoice" width={16} />
                                                                                                </Link>
                                                                                                ):(
                                                                                                <Link
                                                                                                className="font-weight-bold font-xs text-body-secondary"
                                                                                                to={{
                                                                                                    pathname: "/editInvoice",
                                                                                                    search: `?id=${item.invoice_id}&oid=${item.order_id}`
                                                                                                }}>
                                                                                                  <CIcon icon={cilPen} className="float-end" title="Edit Invoice" width={16} />
                                                                                                </Link>
                                                ) : item.order_id === 'B' ? (
                                                <Link
                                                    className="font-weight-bold font-xs text-body-secondary"
                                                    to={{
                                                        pathname: "/viewInvoiceBulk",
                                                        search: `?id=${item.invoice_id}&oid=${item.order_id}`
                                                    }}>
                                                       <CIcon icon={cilNotes} className="float-end" width={16} title="View Invoice"/>
                                                </Link>
                                                ): (
                                                <Link
                                                    className="font-weight-bold font-xs text-body-secondary"
                                                    to={{
                                                        pathname: "/viewInvoice",
                                                        search: `?id=${item.invoice_id}&oid=${item.order_id}`
                                                    }}>
                                                       <CIcon icon={cilNotes} className="float-end" width={16} title="View Invoice"/>
                                                </Link>
                                                )}
                                               </CTableDataCell>
                                             </CTableRow>
                                           ))
                                         ) : (
                                           <CTableRow>
                                             <CTableDataCell colSpan={8}>No data available</CTableDataCell>
                                           </CTableRow>
                                         )}
                           </CTableBody>
                         </CTable>
        </CTabPane>
        <CTabPane visible={activeKey === 3}>
          <p>No Wallet Transactions found.</p>
        </CTabPane>
      </CTabContent>




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

export default ViewCustomer;

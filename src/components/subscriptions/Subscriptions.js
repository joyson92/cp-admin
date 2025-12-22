import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilSortAscending, cilSortDescending, cilSearch, cilNotes, cilPlus, cilPen } from '@coreui/icons';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle
} from '@coreui/react';
import ExcelExport from '../components/ExcelExport';
import Loader from './../Loader';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Main Component
const Subscriptions = () => {
  const [tableData, setTableData] = useState([]);
  const [modalData, setModalData] = useState([]);
  const [modal, setModal] = useState({});
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPageData, setCurrentPageData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [visible, setVisible] = useState(false);
  const currentLocation = useLocation().pathname;
  const navigate = useNavigate();


  const sortByInvoiceDate = () => {
      const sortedItems = [...tableData].sort((a, b) => {
        return sortOrder === 'asc'
          ? new Date(a.invoice_dt) - new Date(b.invoice_dt)
          : new Date(b.invoice_dt) - new Date(a.invoice_dt);
      });

      setTableData(sortedItems);
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

  const search = async () => {
  setLoading(true);
    try {
      const fromDate=searchData.fromDate;
      const toDate = searchData.toDate;
      let url = 'https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/subscriptions/fetch?'
      if (fromDate != undefined && toDate != undefined) {
         url = url + `from=${fromDate}&to=${toDate}`
      }
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const parsedData = JSON.parse(data.data);
      setTableData(parsedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchSubscriptionDetails = async (item) => {
  setLoading(true);
  const cust_id = item.cust_id;
  const invoice_id = item.invoice_id;
    try {
      const response = await fetch(`https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/reports/subscriptions?custid=${cust_id}&invoiceid=${invoice_id}`);
      if (!response.ok) {
         throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const parsedData = JSON.parse(data.data);
      setModalData(parsedData);
      setModal(item);
      setVisible(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
  },
  [currentLocation]);

  return (
  <CRow>
  <> {loading ? ( <Loader /> ): ''} </>
  <CCol xs={12}>
          <CCard className="mb-4">

            <CCardHeader className="d-flex">
              <CCol md="auto" className="me-3">
                <DatePicker
                  selected={searchData.fromDate}
                  onChange={(date) => setSearchData({...searchData, fromDate: format(date, 'yyyy-MM-dd')})}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="From Date"
                  className="form-control"
                />
              </CCol>
              <CCol md="auto" className="me-3">
                <DatePicker
                  selected={searchData.toDate}
                  onChange={(date) => setSearchData({...searchData, toDate: format(date, 'yyyy-MM-dd')})}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="To Date"
                  className="form-control"
                />
              </CCol>
              <CCol xs="auto">
                <CIcon
                                icon={cilSearch}
                                className="float-end"
                                width={20}
                                title="Search"
                                style={{ cursor: 'pointer', margin: '10px' }}
                                onClick={search}
                                />
              </CCol>
              <CCol xs="auto">
                <CIcon
                  icon={cilPlus}
                  className="float-end"
                  width={20}
                  title="Create Subscription"
                  style={{ cursor: 'pointer', margin: '10px' }}
                  onClick={() => {
                     navigate('/addSubscription');
                  }}
                />
              </CCol>
            </CCardHeader>
            <CCardBody style={{ overflowX: 'auto', height: '100vh', overflowY: 'auto' }}>
                <CTable className="table-font" hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Process Type</CTableHeaderCell>
                      <CTableHeaderCell>Customer</CTableHeaderCell>
                      <CTableHeaderCell>Invoice No</CTableHeaderCell>
                      <CTableHeaderCell>Plan</CTableHeaderCell>
                      <CTableHeaderCell>Balance</CTableHeaderCell>
                      <CTableHeaderCell>Start Date</CTableHeaderCell>
                      <CTableHeaderCell>End Date</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(tableData) && tableData.length > 0 ? (
                      <>
                        {tableData.map((item, index) => (
                          <CTableRow key={index}>
                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                            <CTableDataCell>{item.process_type}</CTableDataCell>
                            <CTableDataCell>{item.cust_name}</CTableDataCell>
                            <CTableDataCell>{item.invoice_id}</CTableDataCell>
                            <CTableDataCell>{item.plan}</CTableDataCell>
                            <CTableDataCell>{item.balance}/{item.qty}</CTableDataCell>
                            <CTableDataCell>{format(item.sub_start, 'dd-MM-yyyy')}</CTableDataCell>
                            <CTableDataCell>{format(item.sub_end, 'dd-MM-yyyy')}</CTableDataCell>
                            <CTableDataCell>
                                 <CIcon icon={cilNotes} className="float-end" width={16} title="View Subscription"
                                 onClick={() => fetchSubscriptionDetails(item)}/>

                            <Link
                               className="font-weight-bold font-xs text-body-secondary"
                               to={{
                                  pathname: "/editSubscription",
                                  search: `?id=${item.invoice_id}&custid=${item.cust_id}`
                               }}
                               >
                                 <CIcon icon={cilPen} className="float-end" width={16} title="Edit" style={{marginRight: '10px'}}/>
                            </Link>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </>
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={9}>No data available</CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>

                </CTable>
            </CCardBody>
          </CCard>
          <CModal
                  backdrop="static"
                  visible={visible}
                  onClose={() => setVisible(false)}
                  aria-labelledby="StaticBackdropExampleLabel"
                >
                  <CModalHeader>
                    <CModalTitle id="StaticBackdropExampleLabel">{modal.cust_name} - {modal.plan}</CModalTitle>
                  </CModalHeader>
                  <CModalBody>
                    <CTable className="table-font" hover>
                        <CTableHead>
                          <CTableRow>
                            <CTableHeaderCell scope="col">#</CTableHeaderCell>
                            <CTableHeaderCell>Order #</CTableHeaderCell>
                            <CTableHeaderCell>Order Date</CTableHeaderCell>
                            <CTableHeaderCell>Qty</CTableHeaderCell>
                            <CTableHeaderCell>Delivery Date</CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {Array.isArray(modalData) && modalData.length > 0 ? (
                            <>
                              {modalData.map((item, index) => (
                                <CTableRow key={index}>
                                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                  <CTableDataCell>{item.order_id}</CTableDataCell>
                                  <CTableDataCell>{format(item.order_dt, 'dd-MM-yyyy')}</CTableDataCell>
                                  <CTableDataCell>{item.qty}</CTableDataCell>
                                  <CTableDataCell>{format(item.delivery_dt, 'dd-MM-yyyy')}</CTableDataCell>
                                </CTableRow>
                              ))}
                            </>
                          ) : (
                            <CTableRow>
                              <CTableDataCell colSpan={5}>No data available</CTableDataCell>
                            </CTableRow>
                          )}
                        </CTableBody>

                    </CTable>
                  </CModalBody>
                  <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                      Close
                    </CButton>
                  </CModalFooter>
                </CModal>
        </CCol>
        </CRow>

  );
};

export default Subscriptions;

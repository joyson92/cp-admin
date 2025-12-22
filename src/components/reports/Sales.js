import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilSortAscending, cilSortDescending } from '@coreui/icons';
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
  CFormSelect
} from '@coreui/react';
import ExcelExport from '../components/ExcelExport';
import Loader from './../Loader';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import API from '../../services/apiService';

// Main Component
const Sales = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPageData, setCurrentPageData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});

    useEffect(() => {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }, [showAlert]);

  const sortByDate = () => {
    const sortedItems = [...tableData].sort((a, b) => {
      return sortOrder === 'asc'
        ? new Date(a.order_dt) - new Date(b.order_dt)
        : new Date(b.order_dt) - new Date(a.order_dt);
    });

    setTableData(sortedItems);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortByInvoiceDate = () => {
      const sortedItems = [...tableData].sort((a, b) => {
        return sortOrder === 'asc'
          ? new Date(a.invoice_dt) - new Date(b.invoice_dt)
          : new Date(b.invoice_dt) - new Date(a.invoice_dt);
      });

      setTableData(sortedItems);
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

  const sortByPaymentDate = () => {
      const sortedItems = [...tableData].sort((a, b) => {
        return sortOrder === 'asc'
          ? new Date(a.payment_date) - new Date(b.payment_date)
          : new Date(b.payment_date) - new Date(a.payment_date);
      });

      setTableData(sortedItems);
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

  const search = async () => {
  setLoading(true);
    try {
      const fromDate=searchData.fromDate;
      const toDate = searchData.toDate;
      const location = searchData.location ? searchData.location : 'All';
          const response = await API.get(`/reports/sales?type=sales&from=${fromDate}&to=${toDate}&loc=${location}`);
          if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to fetch sales report. Please contact administrator.', status: 'danger'});
            setShowAlert(true);
          }
          const parsedData = JSON.parse(response.data.data);
          setTableData(parsedData);

          setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const newTotalData = {
      totalPaymentAmount: tableData.reduce((acc, item) => acc + (Math.round(item.payment_amount) || 0), 0),
      pending: tableData.reduce((acc, item) => acc + (Math.round(item.pending) || 0), 0),
      sf: tableData.reduce((acc, item) => acc + (Math.round(item.sf) || 0), 0),
      baseAmount: tableData.reduce((acc, item) => acc + (Math.round(item.base) || 0), 0),
      discount: tableData.reduce((acc, item) => acc + (Math.round(item.discount) || 0), 0),
      subTotal: tableData.reduce((acc, item) => acc + (Math.round(item.subTotal) || 0), 0),
      gst: tableData.reduce((acc, item) => acc + (Math.round(item.gst) || 0), 0),
      totalAmount: tableData.reduce((acc, item) => acc + (Math.round(item.total) || 0), 0),
    };

    setTotalData(newTotalData);
  }, [tableData]);

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
              <CCol md="auto" className="me-3">
                <CFormSelect
                  aria-label="Default select example"
                  value={searchData.location}
                  name="location" id="locationId"
                  onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                  options={[
                  { label: 'All', value: 'All'},
                    { label: 'Goregaon', value: 'Goregaon'},
                    { label: 'Versova', value: 'Versova' },
                    { label: 'Juhu', value: 'Juhu' }
                  ]}
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

            </CCardHeader>
            <CCardBody style={{ overflowX: 'auto', height: '100vh', overflowY: 'auto' }}>
                <CTable className="table-font" hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Invoice Date
                        <CIcon
                          icon={sortOrder === 'asc' ? cilSortAscending : cilSortDescending}
                          className="float-end"
                          width={16}
                          title="Sort by Invoice Date"
                          style={{ cursor: 'pointer', marginRight: '10px' }}
                          onClick={sortByInvoiceDate}
                          />
                      </CTableHeaderCell>
                      <CTableHeaderCell>Invoice No</CTableHeaderCell>
                      <CTableHeaderCell>Order Date
                        <CIcon
                          icon={sortOrder === 'asc' ? cilSortAscending : cilSortDescending}
                          className="float-end"
                          width={16}
                          title="Sort by Order Date"
                          style={{ cursor: 'pointer', marginRight: '10px' }}
                          onClick={sortByDate}
                          />
                      </CTableHeaderCell>
                      <CTableHeaderCell>Order No</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Phone #</CTableHeaderCell>
                      <CTableHeaderCell>GST #</CTableHeaderCell>
                      <CTableHeaderCell>Basic</CTableHeaderCell>
                      <CTableHeaderCell>Discount</CTableHeaderCell>
                      <CTableHeaderCell>Delivery</CTableHeaderCell>
                      <CTableHeaderCell>Amount (A)</CTableHeaderCell>
                      <CTableHeaderCell>GST (B)</CTableHeaderCell>
                      <CTableHeaderCell>Total Amount (A+B)</CTableHeaderCell>
                      <CTableHeaderCell>Category</CTableHeaderCell>
                      <CTableHeaderCell>Payment Date
                        <CIcon
                          icon={sortOrder === 'asc' ? cilSortAscending : cilSortDescending}
                          className="float-end"
                          width={16}
                          title="Sort by Invoice Date"
                          style={{ cursor: 'pointer', marginRight: '10px' }}
                          onClick={sortByPaymentDate}
                          />
                      </CTableHeaderCell>
                      <CTableHeaderCell>Payment (&#8377;)</CTableHeaderCell>
                      <CTableHeaderCell>Pending (&#8377;)</CTableHeaderCell>
                      <CTableHeaderCell>Short fall</CTableHeaderCell>
                      <CTableHeaderCell>Mode</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(tableData) && tableData.length > 0 ? (
                      <>
                        {tableData.map((item, index) => (
                          <CTableRow key={index}>
                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                            <CTableDataCell>{item.invoice_dt ? format(item.invoice_dt, 'dd-MM-yyyy') : ''}</CTableDataCell>
                            <CTableDataCell>{item.invoice_no}</CTableDataCell>
                            <CTableDataCell>{format(item.order_dt, 'dd-MM-yyyy')}</CTableDataCell>
                            <CTableDataCell>{item.order_id}-{item.no_of_orders}</CTableDataCell>
                            <CTableDataCell>{item.contact_person}</CTableDataCell>
                            <CTableDataCell>{item.contact_number}</CTableDataCell>
                            <CTableDataCell>{item.customerGST}</CTableDataCell>
                            <CTableDataCell>{Math.round(item.base)}</CTableDataCell>
                            <CTableDataCell>{Math.round(item.discount)}</CTableDataCell>
                            <CTableDataCell>{item.deliveryCharges}</CTableDataCell>
                            <CTableDataCell>{item.subTotal}</CTableDataCell>
                            <CTableDataCell>{item.gst}</CTableDataCell>
                            <CTableDataCell>{item.total}</CTableDataCell>
                            <CTableDataCell>{item.type}</CTableDataCell>
                            <CTableDataCell>{item.payment_date ? format(item.payment_date, 'dd-MM-yyyy') : ''}</CTableDataCell>
                            <CTableDataCell>{item.payment_amount}</CTableDataCell>
                            <CTableDataCell>{item.pending}</CTableDataCell>
                            <CTableDataCell>{item.sf}</CTableDataCell>
                            <CTableDataCell>{item.payment_mode}</CTableDataCell>
                          </CTableRow>
                        ))}

                        {/* Totals Row */}
                        <CTableRow>
                          <CTableDataCell colSpan={8}></CTableDataCell>
                          <CTableDataCell>{totalData.baseAmount}</CTableDataCell>
                          <CTableDataCell>{totalData.discount}</CTableDataCell>
                          <CTableDataCell></CTableDataCell>
                          <CTableDataCell>{totalData.subTotal}</CTableDataCell>
                          <CTableDataCell>{totalData.gst}</CTableDataCell>
                          <CTableDataCell>{totalData.totalAmount}</CTableDataCell>
                          <CTableDataCell></CTableDataCell>
                          <CTableDataCell></CTableDataCell>
                          <CTableDataCell>{totalData.totalPaymentAmount}</CTableDataCell>
                          <CTableDataCell>{totalData.pending}</CTableDataCell>
                          <CTableDataCell>{totalData.sf}</CTableDataCell>
                          <CTableDataCell></CTableDataCell>
                        </CTableRow>
                      </>
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan={19}>No data available</CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>

                </CTable>
            </CCardBody>
          </CCard>
        </CCol>
        <ExcelExport data={tableData} fileName="Sales.xlsx" totalData={totalData} type="Sales"/>
        </CRow>

  );
};

export default Sales;

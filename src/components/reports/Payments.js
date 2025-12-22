import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { cilSortAscending, cilSortDescending, cilSearch } from '@coreui/icons';
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
} from '@coreui/react';
import ExcelExport from '../components/ExcelExport';
import Loader from './../Loader';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import API from '../../services/apiService';

// Main Component
const Payments = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPageData, setCurrentPageData] = useState([]);
  const [totalData, setTotalData] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});

  useEffect(() => {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => clearTimeout(timer);
    }, [showAlert]);

  const sortByInvoiceDate = () => {
      const sortedItems = [...tableData].sort((a, b) => {
        return sortOrder === 'asc'
          ? new Date(a.i_dt) - new Date(b.i_dt)
          : new Date(b.i_dt) - new Date(a.i_dt);
      });

      setTableData(sortedItems);
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

  const sortByPaymentDate = () => {
      const sortedItems = [...tableData].sort((a, b) => {
        return sortOrder === 'asc'
          ? new Date(a.p_dt) - new Date(b.p_dt)
          : new Date(b.p_dt) - new Date(a.p_dt);
      });

      setTableData(sortedItems);
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

  const search = async () => {
  setLoading(true);
      try {
        const fromDate = searchData.fromDate;
        const toDate = searchData.toDate;
        const response = await API.get(`/reports/payments?from=${fromDate}&to=${toDate}`);
        if (response.status !== 200) {
          setAlertMsg({msg: 'Failed to fetch payment report. Please contact administrator.', status: 'danger'});
          setShowAlert(true);
        }

        const parsedData = JSON.parse(response.data.data);
        setTableData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
  };


  useEffect(() => {
      const newTotalData = {
        totalPaymentAmount: tableData.reduce((acc, item) => acc + (Math.round(item.p_amount) || 0), 0),
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
                  placeholderText="Invoice From"
                  className="form-control"
                />
              </CCol>
              <CCol md="auto" className="me-3">
                <DatePicker
                  selected={searchData.toDate}
                  onChange={(date) => setSearchData({...searchData, toDate: format(date, 'yyyy-MM-dd')})}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Invoice To"
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

            </CCardHeader>
            <CCardBody>
                <CTable className="table-font" hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>

                      <CTableHeaderCell>Order No</CTableHeaderCell>
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
                      <CTableHeaderCell>Amount (A)</CTableHeaderCell>
                      <CTableHeaderCell>GST (B)</CTableHeaderCell>
                      <CTableHeaderCell>Order Amount (A+B)</CTableHeaderCell>
                      <CTableHeaderCell>From</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
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
                      <CTableHeaderCell>Payment Amount</CTableHeaderCell>
                      <CTableHeaderCell>Mode</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(tableData) && tableData.length > 0 ? (
                    <>
                      {            tableData.map((item, index) => (
                                    <CTableRow>
                                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>

                                      <CTableDataCell>{item.order_id}-{item.no_of_orders}</CTableDataCell>
                                      <CTableDataCell>{item.i_dt}</CTableDataCell>
                                      <CTableDataCell>{item.i_no}</CTableDataCell>
                                      <CTableDataCell>{item.subTotal}</CTableDataCell>
                                      <CTableDataCell>{item.gst}</CTableDataCell>
                                      <CTableDataCell>{item.total}</CTableDataCell>
                                      <CTableDataCell>{item.customer_name}</CTableDataCell>
                                      <CTableDataCell>{item.type}</CTableDataCell>
                                      <CTableDataCell>{item.p_dt}</CTableDataCell>
                                      <CTableDataCell>{item.p_amount}</CTableDataCell>
                                      <CTableDataCell>{item.p_mode}</CTableDataCell>
                                    </CTableRow>
                                  ))}
                                  {}
                                  <CTableRow>
                                     <CTableDataCell colSpan={4}></CTableDataCell>
                                     <CTableDataCell>{totalData.subTotal}</CTableDataCell>
                                     <CTableDataCell>{totalData.gst}</CTableDataCell>
                                     <CTableDataCell>{totalData.totalAmount}</CTableDataCell>
                                     <CTableDataCell></CTableDataCell>
                                     <CTableDataCell></CTableDataCell>
                                     <CTableDataCell></CTableDataCell>
                                     <CTableDataCell>{totalData.totalPaymentAmount}</CTableDataCell>
                                     <CTableDataCell></CTableDataCell>
                                  </CTableRow>
                                  </>
                                ) : (
                                  <CTableRow>
                                    <CTableDataCell colSpan={13}>No data available</CTableDataCell>
                                  </CTableRow>
                                )}
                  </CTableBody>
                </CTable>
            </CCardBody>
          </CCard>
        </CCol>
        <ExcelExport data={tableData} fileName="Payments.xlsx" totalData={totalData} type="Payments"/>
        </CRow>

  );
};

export default Payments;

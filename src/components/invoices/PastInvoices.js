import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CIcon from '@coreui/icons-react';
import { cilNotes, cilSortAscending, cilSortDescending, cilPen, cilSearch } from '@coreui/icons';
import {
  CCol,
  CRow,
  CCard,
  CCardHeader,
  CCardBody,
  CTableHeaderCell,
  CTable,
  CTableDataCell,
  CTableHead,
  CTableRow,
  CTableBody,
  CAlert,
  CFormInput,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import { format } from 'date-fns';
import ReactPaginate from 'react-paginate';
import Loader from './../Loader';
import API from '../../services/apiService';

const itemsPerPage = 10;

// Main Component
const PastInvoices = () => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');
  const [invoiceSortOrder, setInvoiceSortOrder] = useState('asc');
  const [currentPageData, setCurrentPageData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const loggedInUser = useSelector(state => state.auth.loggedInUser._t);
  const branch = useSelector((state) => state.auth.loggedInUser?.loc);

  const offset = currentPage * itemsPerPage;
    useEffect(() => {
      // Calculate the start and end indices for slicing the data array
      const currentData = filteredData.slice(offset, offset + itemsPerPage);
      // Update the state only once per render cycle
      setCurrentPageData(currentData);
    }, [filteredData, offset]);

  // Handler for page change
  const handlePageClick = (event) => {
    const newPage = event.selected;
    setCurrentPage(newPage);
  };

  const sortByDate = () => {
      const sortedItems = [...filteredData].sort((a, b) => {
        return sortOrder === 'asc'
          ? new Date(a.invoice_dt) - new Date(b.invoice_dt)
          : new Date(b.invoice_dt) - new Date(a.invoice_dt);
      });

      setFilteredData(sortedItems);
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

  const sortByInvoiceId = () => {
     const sortedItems = [...filteredData].sort((a, b) => {
        const numA = a.invoice_no;
        const numB = b.invoice_no;
        return invoiceSortOrder === 'asc' ? a.invoice_no.localeCompare(b.invoice_no) : b.invoice_no.localeCompare(a.invoice_no);
     });

     setFilteredData(sortedItems);
     setInvoiceSortOrder(invoiceSortOrder === 'asc' ? 'desc' : 'asc');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get(`/invoices/pastInvoices?loc=${branch}&t=${loggedInUser}`);
        if (response.status !== 200) {
          setAlertMsg({msg: 'Failed to fetch past invoices. Please contact administrator.', status: 'danger'});
          setShowAlert(true);
        }
        const parsedData = JSON.parse(response.data.data);
        setTableData(parsedData);
        setFilteredData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showAlert]);

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
            <CCardHeader className="d-flex justify-content-between align-items-center">
                                  <strong>Completed Invoices</strong>
<CCol md="auto">
                      <CInputGroup>
                      <CFormInput type="text" id="searchId" className="form-control"
                        placeholder="Search..."
                         onChange={(e) => {
                           const searchValue = e.target.value.toLowerCase().trim();
                           if (!searchValue) {
                             setFilteredData(tableData);
                             setCurrentPage(0);
                           } else {
                             setFilteredData(
                               tableData.filter(item =>
                                 item.contact_person.toLowerCase().includes(searchValue) ||
                                 item.invoice_no.toLowerCase().includes(searchValue) ||
                                 item.contact_number.toLowerCase().includes(searchValue) ||
                                 item.order_id.toLowerCase().includes(searchValue)
                               )
                             );
                           }
                         }} />
                          <CInputGroupText>
                             <CIcon icon={cilSearch} />
                          </CInputGroupText>
                        </CInputGroup>
                      </CCol>
                                </CCardHeader>
                                <CCardBody>
                                    <CTable className="table-font" hover>
                                      <CTableHead>
                                        <CTableRow>
                                          <CTableHeaderCell scope="col">#</CTableHeaderCell>
                                          <CTableHeaderCell>Invoice Date
                                          <CIcon
                                            icon={sortOrder === 'asc' ? cilSortAscending : cilSortDescending}
                                            className="float-end"
                                            width={16}
                                            title="Sort by Date"
                                            style={{ cursor: 'pointer', marginRight: '10px' }}
                                            onClick={sortByDate}
                                            />
                                          </CTableHeaderCell>
                                          <CTableHeaderCell>Invoice No
                              <CIcon
                                icon={invoiceSortOrder === 'asc' ? cilSortAscending : cilSortDescending}
                                className="float-end"
                                width={16}
                                title="Sort by Invoice No"
                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                onClick={sortByInvoiceId}
                                />
                                          </CTableHeaderCell>
                                          <CTableHeaderCell>Name</CTableHeaderCell>
                                          <CTableHeaderCell>Phone Number</CTableHeaderCell>
                                          <CTableHeaderCell>Order ID</CTableHeaderCell>
                                          <CTableHeaderCell>Order Date</CTableHeaderCell>
                                          <CTableHeaderCell>Invoice Amount</CTableHeaderCell>
                                          <CTableHeaderCell>Payment</CTableHeaderCell>
                                          <CTableHeaderCell>Location</CTableHeaderCell>
                                          <CTableHeaderCell></CTableHeaderCell>
                                        </CTableRow>
                                      </CTableHead>
                                      <CTableBody>
                                        {Array.isArray(currentPageData) && currentPageData.length > 0 ? (
                                                      currentPageData.map((item, index) => (
                                                        <CTableRow key={index}>
                                                         <CTableHeaderCell scope="row">{offset + index + 1}</CTableHeaderCell>
                                                         <CTableDataCell>{format(item.invoice_dt, 'dd-MM-yyyy')}</CTableDataCell>
                                                         <CTableDataCell>{item.invoice_no}</CTableDataCell>
                                                         <CTableDataCell>{item.contact_person}</CTableDataCell>
                                                         <CTableDataCell>{item.contact_number}</CTableDataCell>
                                                         <CTableDataCell>{item.order_id}-{item.no_of_orders}</CTableDataCell>
                                                         <CTableDataCell>{format(item.order_dt, 'dd-MM-yyyy')}</CTableDataCell>
                                                         <CTableDataCell>&#8377;{item.total}</CTableDataCell>
                                                         <CTableDataCell>{item.payment_mode}</CTableDataCell>
                                                         <CTableDataCell>{item.branch}</CTableDataCell>
                                                         <CTableDataCell>
                                             { loggedInUser === '_sa1' ? (
                                             item.order_id === 'B' ? (
                                                <Link
                                                className="font-weight-bold font-xs text-body-secondary"
                                                to={{
                                                    pathname: "/editInvoiceBulk",
                                                    search: `?id=${item.invoice_no}&oid=${item.order_id}`
                                                }}>
                                                  <CIcon icon={cilPen} className="float-end" title="Edit Invoice" width={16} style={{marginLeft: '10px'}} />
                                                </Link>
                                                ):(
                                                <Link
                                                className="font-weight-bold font-xs text-body-secondary"
                                                to={{
                                                    pathname: "/editInvoice",
                                                    search: `?id=${item.invoice_no}&oid=${item.order_id}`
                                                }}>
                                                  <CIcon icon={cilPen} className="float-end" title="Edit Invoice" width={16} style={{marginLeft: '10px'}} />
                                                </Link>
                                            )): null}
                                             {item.order_id === 'B' ? (
                                                <Link
                                                className="font-weight-bold font-xs text-body-secondary"
                                                to={{
                                                    pathname: "/viewInvoiceBulk",
                                                    search: `?id=${item.invoice_no}&oid=${item.order_id}`
                                                }}>
                                                  <CIcon icon={cilNotes} className="float-end" title="View Invoice" width={16} />
                                                </Link>
                                                ):(
                                                <Link
                                                className="font-weight-bold font-xs text-body-secondary"
                                                to={{
                                                    pathname: "/viewInvoice",
                                                    search: `?id=${item.invoice_no}&oid=${item.order_id}`
                                                }}>
                                                  <CIcon icon={cilNotes} className="float-end" width={16} title="View Invoice"/>
                                                </Link>
                                            )}
                                                         </CTableDataCell>
                                                        </CTableRow>
                                                      ))
                                                    ) : (
                                                      <CTableRow>
                                                      <CTableDataCell colSpan={9}>No data available</CTableDataCell>
                                                      </CTableRow>
                                                    )}
                                      </CTableBody>
                                    </CTable>
                                    <ReactPaginate
                                       previousLabel={'<<'}
                                       nextLabel={'>>'}
                                       breakLabel={'...'}
                                       pageCount={Math.ceil(filteredData.length / itemsPerPage)}
                                       marginPagesDisplayed={2}
                                       pageRangeDisplayed={5}
                                       onPageChange={handlePageClick}
                                       containerClassName={'pagination'}
                                       pageClassName={'page-item'}
                                       pageLinkClassName={'page-link'}
                                       previousClassName={'page-item'}
                                       previousLinkClassName={'page-link'}
                                       nextClassName={'page-item'}
                                       nextLinkClassName={'page-link'}
                                       breakClassName={'page-item'}
                                       breakLinkClassName={'page-link'}
                                       activeClassName={'active'}
                                       />
                                </CCardBody>
        </CCard>
    </CCol>
  </CRow>

  );
};

export default PastInvoices;

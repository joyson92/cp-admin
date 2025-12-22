import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CIcon from '@coreui/icons-react';
import { cilPen, cilNotes, cilSortAscending, cilSortDescending, cilSearch } from '@coreui/icons';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CCol
} from '@coreui/react';
import { format } from 'date-fns';
import ReactPaginate from 'react-paginate';

const itemsPerPage = 10;

// Main Component
const PastOrders = (props) => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPageData, setCurrentPageData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const loggedInUser = useSelector(state => state.auth.loggedInUser._t);

  const offset = currentPage * itemsPerPage;
  useEffect(() => {
    const currentData = filteredData.slice(offset, offset + itemsPerPage);
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
        ? new Date(a.order_dt) - new Date(b.order_dt)
        : new Date(b.order_dt) - new Date(a.order_dt);
      });

      setFilteredData(sortedItems);
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortByOrderId = () => {
        const sortedItems = [...filteredData].sort((a, b) => {
          const numA = parseInt(a.order_id.slice(1)); // Remove the first character and convert to a number
          const numB = parseInt(b.order_id.slice(1));
          return sortOrder === 'asc' ? numA - numB : numB - numA;
        });

        setFilteredData(sortedItems);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      };

    useEffect(() => {
        setTableData(props.tableData || []);
        setFilteredData(props.tableData || []);
    }, [props.tableData]);

  return (
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Completed Orders</strong>
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
                            <CTableHeaderCell>Order Date
                              <CIcon
                                icon={sortOrder === 'asc' ? cilSortAscending : cilSortDescending}
                                className="float-end"
                                width={16}
                                title="Sort by Date"
                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                onClick={sortByDate}
                                />
                            </CTableHeaderCell>
                            <CTableHeaderCell>Delivery Date</CTableHeaderCell>
                            <CTableHeaderCell>Name</CTableHeaderCell>
                            <CTableHeaderCell>Phone Number</CTableHeaderCell>
                            <CTableHeaderCell>Order ID
                              <CIcon
                                icon={sortOrder === 'asc' ? cilSortAscending : cilSortDescending}
                                className="float-end"
                                width={16}
                                title="Sort by Order ID"
                                style={{ cursor: 'pointer', marginRight: '10px' }}
                                onClick={sortByOrderId}
                                />
                            </CTableHeaderCell>
                            <CTableHeaderCell>Status</CTableHeaderCell>
                            <CTableHeaderCell>Assigned to</CTableHeaderCell>
                            <CTableHeaderCell>Total</CTableHeaderCell>
                            <CTableHeaderCell>Location</CTableHeaderCell>
                            <CTableHeaderCell></CTableHeaderCell>
                          </CTableRow>
                        </CTableHead>
                        <CTableBody>
                          {Array.isArray(currentPageData) && currentPageData.length > 0 ? (
                            currentPageData.map((item, index) => (
                              <CTableRow key={index}>
                                <CTableHeaderCell scope="row">{offset + index + 1}</CTableHeaderCell>
                                <CTableDataCell>{format(new Date(item.order_dt), 'dd-MM-yyyy')}</CTableDataCell>
                                <CTableDataCell>{item.delivery_dt? format(new Date(item.delivery_dt), 'dd-MM-yyyy'): ''}</CTableDataCell>
                                <CTableDataCell>{item.contact_person}</CTableDataCell>
                                <CTableDataCell>{item.contact_number}</CTableDataCell>
                                <CTableDataCell>{item.order_id}-{item.no_of_orders}</CTableDataCell>
                                <CTableDataCell>{item.status}</CTableDataCell>
                                <CTableDataCell>{item.assigned_to ? item.assigned_to.split('#')[0] : ''} {item.assigned_to ? item.assigned_to.split('#')[1]: ''}</CTableDataCell>
                                <CTableDataCell>{item.total}</CTableDataCell>
                                <CTableDataCell>{item.loc}</CTableDataCell>
                                <CTableDataCell>
                                    { loggedInUser === '_sa1' ? (
                                                <Link
                                                    className="font-weight-bold font-xs text-body-secondary"
                                                    to={{
                                                        pathname: "/orders/editOrder",
                                                        search: `?id=${item.order_id}&orderNo=${item.no_of_orders}`
                                                    }}>
                                                      <CIcon icon={cilPen} className="float-end" title="Update Order" width={16} style={{marginLeft: '10px'}}/>
                                                </Link>
                                                ): null}
                                  <Link
                                    className="font-weight-bold font-xs text-body-secondary"
                                    to={{
                                      pathname: "/orders/viewOrder",
                                      search: `?id=${item.order_id}&orderNo=${item.no_of_orders}`
                                    }}
                                  >
                                    <CIcon icon={cilNotes} className="float-end" width={16} title="View Order"/>
                                  </Link>
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
  );
};

export default PastOrders;

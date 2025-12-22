import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilPen, cilPlus, cilSortAscending, cilSortDescending, cilCircle, cilSearch } from '@coreui/icons';
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
const CurrentOrders = (props) => {
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPageData, setCurrentPageData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);


  // Calculate the start and end indices for slicing the data array
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
      ? new Date(a.order_dt) - new Date(b.order_dt)
      : new Date(b.order_dt) - new Date(a.order_dt);
    });

    setFilteredData(sortedItems);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const sortByDueDate = () => {
    const sortedItems = [...filteredData].sort((a, b) => {
      return sortOrder === 'asc'
      ? new Date(a.due_dt) - new Date(b.due_dt)
      : new Date(b.due_dt) - new Date(a.due_dt);
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

  const getStatusColor = (status) => {
      switch (status) {
        case 'Booked':
          return 'blue';  // Blue for booked
        case 'In-Progress':
          return 'orange';  // Orange for in-progress
        default:
          return 'gray';  // Gray for unknown statuses
      }
    };

  useEffect(() => {
      setTableData(props.tableData || []);
      setFilteredData(props.tableData || []);
  }, [props.tableData]);

  return (
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Orders List</strong>
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
                                 item.loc.toLowerCase().includes(searchValue) ||
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
                      <CTableHeaderCell>Schedule Time</CTableHeaderCell>
                      <CTableHeaderCell>Due Date
                        <CIcon
                          icon={sortOrder === 'asc' ? cilSortAscending : cilSortDescending}
                          className="float-end"
                          width={16}
                          title="Sort by Date"
                          style={{ cursor: 'pointer', marginRight: '10px' }}
                          onClick={sortByDueDate}
                          />
                      </CTableHeaderCell>
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
                                     <CTableHeaderCell scope="row">{offset + index + 1}
                                        <CIcon icon={cilCircle} className="float-end" width={14} title={item.status}
                                         style={{ color: getStatusColor(item.status) }}/>
                                     </CTableHeaderCell>
                                    <CTableDataCell>{format(item.order_dt, 'dd-MM-yyyy')}</CTableDataCell>
                                    <CTableDataCell>{item.contact_person}</CTableDataCell>
                                    <CTableDataCell>{item.contact_number}</CTableDataCell>
                                    <CTableDataCell>{item.order_id}-{item.no_of_orders}</CTableDataCell>
                                    <CTableDataCell>{item.timing}</CTableDataCell>
                                    <CTableDataCell>{item.due_dt ? format(item.due_dt, 'dd-MM-yyyy'): ''}</CTableDataCell>
                                    <CTableDataCell>{item.assigned_to ? item.assigned_to.split('#')[0] : ''} {item.assigned_to ? item.assigned_to.split('#')[1]: ''}</CTableDataCell>
                                    <CTableDataCell>{item.total}</CTableDataCell>
                                    <CTableDataCell>{item.loc}</CTableDataCell>
                                    <CTableDataCell>
                                    <Link
                                      className="font-weight-bold font-xs text-body-secondary"
                                      to={{
                                        pathname: "/orders/duplicateOrder",
                                        search: `?id=${item.order_id}`
                                      }}
                                      >
                                        <CIcon icon={cilPlus} className="float-end" width={16} title="Create Another Order" />
                                      </Link>
                                     <Link
                                       className="font-weight-bold font-xs text-body-secondary"
                                       to={{
                                          pathname: "/orders/editOrder",
                                          search: `?id=${item.order_id}&orderNo=${item.no_of_orders}`
                                       }}
                                       >
                                          <CIcon icon={cilPen} className="float-end" width={16} title="Edit" style={{marginRight: '10px'}}/>
                                     </Link>
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

export default CurrentOrders;

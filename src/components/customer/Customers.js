import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilSortAscending, cilSortDescending, cilPen, cilSearch } from '@coreui/icons';
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
  CFormInput,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';
import Loader from './../Loader';
import { format } from 'date-fns';
import API from '../../services/apiService';

// Main Component
const Customers = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showAlert]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get('/customers');
        if (response.status !== 200) {
          setAlertMsg({msg: 'Failed to fetch customers list. Please contact administrator.', status: 'danger'});
          setShowAlert(true);
        }
        const parsedData = JSON.parse(response.data.body);
        setTableData(parsedData);
        setFilteredData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
  <CRow>
  <> {loading ? ( <Loader /> ): ''} </>
  <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Customers</strong>
              <CCol md="auto">
              <CInputGroup>
              <CFormInput type="text" id="searchId" className="form-control"
                placeholder="Search..."
                 onChange={(e) => {
                   const searchValue = e.target.value.toLowerCase().trim();
                   if (!searchValue) {
                     setFilteredData(tableData);
                   } else {
                     setFilteredData(
                       tableData.filter(item =>
                         item.customer_name.toLowerCase().includes(searchValue) ||
                         item.primary_number.includes(searchValue)
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
                      <CTableHeaderCell>Customer #</CTableHeaderCell>
                      <CTableHeaderCell>Customer Name</CTableHeaderCell>
                      <CTableHeaderCell>Contact Number</CTableHeaderCell>
                      <CTableHeaderCell>Billed</CTableHeaderCell>
                      <CTableHeaderCell>Last Ordered On</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(filteredData) && filteredData.length > 0 ? (
                                  filteredData.map((item, index) => (
                                    <CTableRow key={index}>
                                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                      <CTableDataCell>{item.cust_id}</CTableDataCell>
                                      <CTableDataCell>{item.customer_name}</CTableDataCell>
                                      <CTableDataCell>{item.primary_number}</CTableDataCell>
                                      <CTableDataCell>{item.billed}</CTableDataCell>
                                      <CTableDataCell>{item.last_order}</CTableDataCell>
                                      <CTableDataCell>
                                        <Link
                                          className="font-weight-bold font-xs text-body-secondary"
                                          to={{
                                            pathname: "/viewCustomer",
                                            search: `?id=${item.cust_id}`
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
            </CCardBody>
          </CCard>
        </CCol>

        </CRow>

  );
};

export default Customers;

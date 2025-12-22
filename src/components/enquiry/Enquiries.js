import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilSortAscending, cilSortDescending, cilSearch, cilNotes } from '@coreui/icons';
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
  CButton
} from '@coreui/react';
import ExcelExport from '../components/ExcelExport';
import Loader from './../Loader';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Main Component
const Enquiries = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchData, setSearchData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/enquiries');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const parsedData = JSON.parse(data.body);
        setTableData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const search = async () => {
    setLoading(true);
        try {
          const fromDate = searchData.fromDate;
          const toDate = searchData.toDate;
          const response = await fetch(`https://qg3ps7eof3.execute-api.us-east-1.amazonaws.com/Test/enquiries?from=${fromDate}&to=${toDate}`);
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          const data = await response.json();
          const parsedData = JSON.parse(data.body);
          setTableData(parsedData);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
  };

  const sortByDate = () => {
      const sortedItems = [...tableData].sort((a, b) => {
            return sortOrder === 'asc'
              ? new Date(a.enquiry_date + " " + a.initiate_time) - new Date(b.enquiry_date + " " + b.initiate_time)
              : new Date(b.enquiry_date + " " + b.initiate_time) - new Date(a.enquiry_date + " " + a.initiate_time);
          });
          setTableData(sortedItems);
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

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
                  placeholderText="Enquiry From"
                  className="form-control"
                />
              </CCol>
              <CCol md="auto" className="me-3">
                <DatePicker
                  selected={searchData.toDate}
                  onChange={(date) => setSearchData({...searchData, toDate: format(date, 'yyyy-MM-dd')})}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Enquiry To"
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
                      <CTableHeaderCell>Enquiry Date
                        <CIcon
                          icon={sortOrder === 'asc' ? cilSortAscending : cilSortDescending}
                          className="float-end"
                          width={16}
                          title="Sort by Date"
                          style={{ cursor: 'pointer', marginRight: '10px' }}
                          onClick={sortByDate}
                          />
                      </CTableHeaderCell>
                      <CTableHeaderCell>Contact Number</CTableHeaderCell>
                      <CTableHeaderCell>Whatsapp Name</CTableHeaderCell>
                      <CTableHeaderCell>View Message</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(tableData) && tableData.length > 0 ? (
                                  tableData.map((item, index) => (
                                    <CTableRow>
                                      <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                      <CTableDataCell>{format(item.enquiry_date, 'dd-MM-yyyy')} {item.initiate_time}</CTableDataCell>
                                      <CTableDataCell>{item.contact_number}</CTableDataCell>
                                      <CTableDataCell>{item.whatsapp_name}</CTableDataCell>
                                      <CTableDataCell>
                                      <Link
                                        className="font-weight-bold font-xs text-body-secondary"
                                        to={{
                                          pathname: "/enquiries/viewEnquiry",
                                          search: `?dt=${item.enquiry_date}&cn=${item.contact_number}`
                                        }}
                                        >
                                         <CIcon icon={cilNotes} className="float-end" width={16} title="View Message" style={{marginRight: '10px'}}/>
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

export default Enquiries;

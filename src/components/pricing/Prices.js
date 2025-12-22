import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { cilPen, cilTrash, cilPlus, cilSearch } from '@coreui/icons';
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
  CInputGroup,
  CInputGroupText,
  CFormInput
} from '@coreui/react';
import Loader from './../Loader';
import API from '../../services/apiService';
import AlertMessage from '../shared/AlertMessage';
import ReactPaginate from 'react-paginate';

const itemsPerPage = 20;

const Prices = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ msg: '', status: 'success', redirect: '' });
  const loggedInUser = useSelector(state => state.auth.loggedInUser._t);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPageData, setCurrentPageData] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc');

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

  useEffect(() => {
    fetchData();
  }, []);

    const fetchData = async () => {
      try {
        const response = await API.get('/pricing');
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to fetch orders. Please contact administrator.', status: 'danger'});
            setShowAlert(true);
        }
        const parsedData = JSON.parse(response.data.body);
        setTableData(parsedData);
        setFilteredData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

  const deletePrice = async(e) => {
      try {
        setLoading(true);
        const response = await API.get(`/pricing/delete?did=${e}`);
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to delete pricing record. Please contact administrator.', status: 'danger'});
        } else {
            const parsedData = JSON.parse(response.data.body);
            setAlertMsg({msg: parsedData['message'], status: parsedData['status']});
            fetchData();
        }
        setShowAlert(true);
        setLoading(false);
      } catch (error) {
        setAlertMsg({msg: 'Failed to delete pricing record. Please contact administrator.', status: 'danger'});
        setShowAlert(true);
        setLoading(false);
      }
  };



  return (
  <CRow>
  <> {loading ? ( <Loader /> ): ''} </>
    <AlertMessage
          show={showAlert}
          setShow={setShowAlert}
          message={alertMsg.msg}
          status={alertMsg.status}
          duration={5000}
          redirectTo={alertMsg.redirect}
        />
  <CCol xs={12}>
          <CCard className="mb-4">

            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Pricing</strong>
              <CCol xs="auto">
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
                                 item.type.toLowerCase().includes(searchValue) ||
                                 item.category.toLowerCase().includes(searchValue) ||
                                 item.pricedAt.toLowerCase().includes(searchValue)
                               )
                             );
                           }
                         }} />
                          <CInputGroupText>
                             <CIcon icon={cilSearch} />
                          </CInputGroupText>
                        </CInputGroup>
                </CCol>
                <CCol xs="auto">
              { loggedInUser === '_sa1' ? (
                <CIcon icon={cilPlus} className="float-end" width={22} title="Add Pricing" style={{cursor: 'pointer', marginRight: '10px'}}
                    onClick={() => navigate('/prices/addPrice')}/>
                ): null}
              </CCol>
            </CCardHeader>
            <CCardBody>
                <CTable className="table-font" hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Category</CTableHeaderCell>
                      <CTableHeaderCell>Price</CTableHeaderCell>
                      <CTableHeaderCell>Priced At</CTableHeaderCell>
                      <CTableHeaderCell>GST %</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(currentPageData) && currentPageData.length > 0 ? (
                                  currentPageData.map((item, index) => (
                                    <CTableRow key={index}>
                                     <CTableHeaderCell scope="row">{offset + index + 1}</CTableHeaderCell>
                                     <CTableDataCell>{item && item.type ? item.type.split('#')[0]: ''}</CTableDataCell>
                                    <CTableDataCell>{item.category}</CTableDataCell>
                                    <CTableDataCell>{item.price}</CTableDataCell>
                                    <CTableDataCell>{item.pricedAt}</CTableDataCell>
                                    <CTableDataCell>{item.gst}</CTableDataCell>
                                    <CTableDataCell>
                                    { loggedInUser === '_sa1' ? (
                                    <>
                                    <CIcon icon={cilTrash} className="float-end" width={16} title="Delete" style={{marginRight: '10px'}}
                                    onClick={() => deletePrice(item.id)}/>
                                        <Link
                                           className="font-weight-bold font-xs text-body-secondary"
                                           to={{
                                              pathname: "/prices/editPrice",
                                              search: `?id=${item.id}`
                                           }}
                                           >
                                             <CIcon icon={cilPen} className="float-end" width={16} title="Edit" style={{marginRight: '10px'}}/>
                                        </Link>
                                        </>
                                    ): null}
                                    </CTableDataCell>
                                    </CTableRow>
                                  ))
                                ) : (
                                  <CTableRow>
                                  <CTableDataCell colSpan={7}>No data available</CTableDataCell>
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

export default Prices;

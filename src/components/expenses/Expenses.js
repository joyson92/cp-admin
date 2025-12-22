import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { cilPen, cilTrash, cilUserFollow, cilPlus, cilList, cilSearch } from '@coreui/icons';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CInputGroup,
  CFormInput,
  CInputGroupText
} from '@coreui/react';
import Loader from './../Loader';
import API from '../../services/apiService';
import AlertMessage from '../shared/AlertMessage';


const Expenses = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ msg: '', status: 'success', redirect: '' });
  const loggedInUser = useSelector(state => state.auth.loggedInUser._t);

  useEffect(() => {
    fetchData();
  }, []);

    const fetchData = async () => {
      try {
        const response = await API.get('/expenses');
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to fetch expenses. Please contact administrator.', status: 'danger'});
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

  const deletePrice = async(e) => {
      try {
        setLoading(true);
        const response = await API.get(`/expenses/delete?did=${e}`);
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to delete. Please contact administrator.', status: 'danger'});
        } else {
            const parsedData = JSON.parse(response.data.body);
            setAlertMsg({msg: parsedData['message'], status: parsedData['status']});
            fetchData();
        }
        setShowAlert(true);
        setLoading(false);
      } catch (error) {
        setAlertMsg({msg: 'Failed to delete. Please contact administrator.', status: 'danger'});
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
              <strong>Expenses</strong>
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
                                       item.edate.toLowerCase().includes(searchValue) ||
                                       item.name.toLowerCase().includes(searchValue) ||
                                       item.type.toLowerCase().includes(searchValue) ||
                                       item.mode.toLowerCase().includes(searchValue) ||
                                       item.loc.toLowerCase().includes(searchValue)
                                     )
                                   );
                                 }
                               }} />
                                <CInputGroupText>
                                   <CIcon icon={cilSearch} />
                                </CInputGroupText>
                              </CInputGroup>
                            </CCol>
              <CCol md="auto">
                <CIcon icon={cilPlus} className="float-end" width={22} title="Add new expense " style={{marginRight: '10px', cursor: 'pointer'}}
                    onClick={() => navigate('/addExpense')}/>
                <CIcon icon={cilUserFollow} className="float-end" width={22} title="Add new payer " style={{marginRight: '10px', cursor: 'pointer'}}
                    onClick={() => navigate('/payers/add')}/>
                <CIcon icon={cilList} className="float-end" width={22} title="Add new category " style={{marginRight: '10px', cursor: 'pointer'}}
                    onClick={() => navigate('/category/add')}/>
              </CCol>
            </CCardHeader>
            <CCardBody>
                <CTable className="table-font" hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Expense Date</CTableHeaderCell>
                      <CTableHeaderCell>Paid To</CTableHeaderCell>
                      <CTableHeaderCell>Category Type</CTableHeaderCell>
                      <CTableHeaderCell>Payment Mode</CTableHeaderCell>
                      <CTableHeaderCell>Amount</CTableHeaderCell>
                      <CTableHeaderCell>Location</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(filteredData) && filteredData.length > 0 ? (
                                  filteredData.map((item, index) => (
                                    <CTableRow key={index}>
                                     <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                     <CTableDataCell>{item.edate}</CTableDataCell>
                                    <CTableDataCell>{item.name}</CTableDataCell>
                                    <CTableDataCell>{item.type}</CTableDataCell>
                                    <CTableDataCell>{item.mode}</CTableDataCell>
                                    <CTableDataCell>{item.amount}</CTableDataCell>
                                    <CTableDataCell>{item.loc}</CTableDataCell>
                                    <CTableDataCell>
                                    { loggedInUser === '_sa1' ? (
                                    <>
                                    <CIcon icon={cilTrash} className="float-end" width={16} title="Delete" style={{marginRight: '10px'}}
                                    onClick={() => deletePrice(item.id)}/>
                                        <Link
                                           className="font-weight-bold font-xs text-body-secondary"
                                           to={{
                                              pathname: "/editExpense",
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
                                  <CTableDataCell colSpan={5}>No data available</CTableDataCell>
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

export default Expenses;

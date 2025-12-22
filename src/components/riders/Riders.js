import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilPen, cilSearch, cilPlus, cilTrash } from '@coreui/icons';
import { useNavigate } from 'react-router-dom';
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
} from '@coreui/react';
import Loader from './../Loader';
import API from '../../services/apiService';
import AlertMessage from '../shared/AlertMessage';

// Main Component
const Riders = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ msg: '', status: 'success', redirect: '' });

    const fetchData = async () => {
      try {
        const response = await API.get('/riders');
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to fetch riders list. Please contact administrator.', status: 'danger'});
            setShowAlert(true);
        }
        const parsedData = JSON.parse(response.data.body);
        setTableData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, []);

  const deleteRider = async(e) => {
      try {
        setLoading(true);
        const response = await API.get(`/riders/delete?did=${e}`);
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to delete rider record. Please contact administrator.', status: 'danger'});
        } else {
            const parsedData = JSON.parse(response.data.body);
            setAlertMsg({msg: parsedData['message'], status: parsedData['status']});
            fetchData();
        }
        setShowAlert(true);
        setLoading(false);
      } catch (error) {
        setAlertMsg({msg: 'Failed to delete rider record. Please contact administrator.', status: 'danger'});
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
              <strong>Riders List</strong>
              <CIcon icon={cilPlus} className="float-end" width={22} title="Add Rider" style={{cursor: 'pointer', marginRight: '10px'}}
                 onClick={() => navigate('/riders/addRider')}/>
            </CCardHeader>
            <CCardBody>
                <CTable className="table-font" hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Rider Name</CTableHeaderCell>
                      <CTableHeaderCell>Phone Number</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(tableData) && tableData.length > 0 ? (
                                  tableData.map((item, index) => (
                                    <CTableRow>
                                     <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                    <CTableDataCell>{item.firstNameId} {item.lastNameId}</CTableDataCell>
                                    <CTableDataCell>{item.phoneNumberId}</CTableDataCell>
                                    <CTableDataCell>{item.status}</CTableDataCell>
                                    <CTableDataCell>
                                        <CIcon icon={cilTrash} className="float-end utility-icons" width={16} title="Delete"
                                                                            onClick={() => deleteRider(item.id)}/>
                                        <Link
                                          className="font-weight-bold font-xs text-body-secondary"
                                          to={{
                                            pathname: "/riders/editRider",
                                            search: `?id=${item.id}`
                                          }}
                                          >
                                        <CIcon icon={cilPen} className="float-end utility-icons" width={16} title="Update Rider" />
                                        </Link>
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

export default Riders;

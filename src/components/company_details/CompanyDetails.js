import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilPen, cilPlus } from '@coreui/icons';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get('/companydetails');
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to fetch company details. Please contact administrator.', status: 'danger'});
            setShowAlert(true);
        }
        const parsedData = JSON.parse(response.data.body);
        setTableData(parsedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

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
              <strong>Company Details List</strong>
              <CIcon icon={cilPlus} className="float-end" width={22} title="Add Company Details" style={{cursor: 'pointer', marginRight: '10px'}}
                 onClick={() => navigate('/companyDetails/addCompanyDetails')}/>
            </CCardHeader>
            <CCardBody>
                <CTable className="table-font" hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Pick-Up Area</CTableHeaderCell>
                      <CTableHeaderCell>Operation Head</CTableHeaderCell>
                      <CTableHeaderCell>Contact Number</CTableHeaderCell>
                      <CTableHeaderCell>GST #</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(tableData) && tableData.length > 0 ? (
                                  tableData.map((item, index) => (
                                    <CTableRow>
                                     <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                    <CTableDataCell>{item.pickUpArea}</CTableDataCell>
                                    <CTableDataCell>{item.operationHead}</CTableDataCell>
                                    <CTableDataCell>{item.operationHeadNumber}</CTableDataCell>
                                    <CTableDataCell>{item.gst}</CTableDataCell>
                                    <CTableDataCell>
                                        <Link
                                            className="font-weight-bold font-xs text-body-secondary"
                                            to={{
                                               pathname: "/companyDetails/editCompanyDetails",
                                               search: `?id=${item.pickUpArea}`
                                            }}>
                                            <CIcon icon={cilPen} className="float-end" width={16} />
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

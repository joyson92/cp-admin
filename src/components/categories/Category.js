import React, { useState, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { cilPen, cilTrash, cilPlus } from '@coreui/icons';
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
  CTableRow
} from '@coreui/react';
import Loader from './../Loader';
import API from '../../services/apiService';
import AlertMessage from '../shared/AlertMessage';


const Category = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ msg: '', status: 'success', redirect: '' });
  const loggedInUser = useSelector(state => state.auth.loggedInUser._t);

  useEffect(() => {
    fetchData();
  }, []);

    const fetchData = async () => {
      try {
        const response = await API.get('/categories');
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to fetch categories. Please contact administrator.', status: 'danger'});
            setShowAlert(true);
        }
        const parsedData = JSON.parse(response.data.data);
        setTableData(parsedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

  const deleteCategory = async(e) => {
      try {
        setLoading(true);
        const response = await API.get(`/categories/delete?did=${e}`);
        if (response.status !== 200) {
            setAlertMsg({msg: 'Failed to delete. Please contact administrator.', status: 'danger'});
        } else {
            const parsedData = JSON.parse(response.data.data);
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
              <strong>Categories List</strong>
              <CCol md="auto">
                <CIcon icon={cilPlus} className="float-end" width={22} title="Add new category " style={{marginRight: '10px', cursor: 'pointer'}}
                    onClick={() => navigate('/category/add')}/>
              </CCol>
            </CCardHeader>
            <CCardBody>
                <CTable className="table-font" hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell>Category Name</CTableHeaderCell>
                      <CTableHeaderCell>Description</CTableHeaderCell>
                      <CTableHeaderCell></CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {Array.isArray(tableData) && tableData.length > 0 ? (
                                  tableData.map((item, index) => (
                                    <CTableRow key={index}>
                                     <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                                     <CTableDataCell>{item.name}</CTableDataCell>
                                    <CTableDataCell>{item.description}</CTableDataCell>
                                    <CTableDataCell>
                                    { loggedInUser === '_sa1' ? (
                                    <>
                                    <CIcon icon={cilTrash} className="float-end" width={16} title="Delete" style={{marginRight: '10px'}}
                                    onClick={() => deleteCategory(item.id)}/>
                                        <Link
                                           className="font-weight-bold font-xs text-body-secondary"
                                           to={{
                                              pathname: `/category/${item.id}/edit`
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
                                  <CTableDataCell colSpan={4}>No data available</CTableDataCell>
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

export default Category;

import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CCardText
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const loginFailedMessage = useSelector(state => state.auth.message);
  const navigate = useNavigate();

  const loginSuccess = (username) => ({
    type: 'LOGIN_SUCCESS',
    payload: { username },
  });

  const loginFailure = (error) => ({
    type: 'LOGIN_FAILURE',
    payload: { error },
  });

  const logout = () => ({
    type: 'LOGOUT',
  });

  const handleLogin = async() => {
      try {
          const data = await login(username, password);
          dispatch(loginSuccess(data));
          navigate('/');
      } catch (error) {
          dispatch(loginFailure(error.message));
      }
  };

  useEffect(() => {
      const userName = JSON.parse(sessionStorage.getItem('userName'));
      console.log('jjj');
      if (userName) {
        // Dispatch an action to restore login state
        dispatch(loginSuccess(userName)); // Replace with actual logic to get username
//        navigate('/'); // commented on 30/7/2025 due to reload redirecting to dashboard
      }
    }, [dispatch, navigate]);

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-5">
                <CCardBody>
                  <CForm>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="Username"
                       autoComplete="username"
                       floatingLabel="Username"
                       value={username} onChange={(e) => setUsername(e.target.value)}/>
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        floatingLabel="Password"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                      <CCardText className="text-danger">{loginFailedMessage}</CCardText>
                        <CButton color="primary" className="px-4" onClick={handleLogin}>
                          Login
                        </CButton>
                      </CCol>

                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login

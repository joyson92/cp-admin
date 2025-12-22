import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CAlert } from '@coreui/react';

const AlertMessage = ({ show, setShow, message, duration = 5000, redirectTo = null, status = 'success' }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
        if (redirectTo && typeof redirectTo === 'string' && redirectTo.trim() !== '') {
          navigate(redirectTo);
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <>
      {show && (
        <div className="alert-container">
          <CAlert color={status} variant="solid">
            {message}
          </CAlert>
        </div>
      )}
    </>
  );
};

export default AlertMessage;

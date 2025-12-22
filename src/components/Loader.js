// Loader.js
import React from 'react';
import { CSpinner } from '@coreui/react';

const Loader = () => {
  return (
    <div className="loader-container">
      <CSpinner />
      <p>Loading...</p>
    </div>
  );
};

export default Loader;

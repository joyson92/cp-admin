import React, { useState, useEffect } from 'react';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Orders from "./orders";

// Footer Component
const Footer = () => (
  <footer className="footer">
    <div className="d-sm-flex justify-content-center justify-content-sm-between">

      <span className="float-none float-sm-end d-block mt-1 mt-sm-0 text-center">Copyright © 2024. All rights
        reserved.</span>
    </div>
  </footer>
);

// Main Component
const MainContent = () => {
  return (
    <div className="main-panel">

            <BrowserRouter>
                <Routes>
                    <Route path="/orders" element={<Orders/>} />
                </Routes>
            </BrowserRouter>

      <Footer />
    </div>
  );
};

export default MainContent;

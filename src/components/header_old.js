import React from 'react';

class Header extends React.Component {
  render() {
    return (
      <nav className="navbar default-layout col-lg-12 col-12 p-0 fixed-top d-flex align-items-top flex-row">
        <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-start">
          <div className="me-3">
            <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-bs-toggle="minimize">
              <span className="icon-menu"></span>
            </button>
          </div>

        </div>
        <div className="navbar-menu-wrapper d-flex align-items-top">
          <ul className="navbar-nav">
            <li className="nav-item font-weight-semibold d-none d-lg-block ms-0">
              <h1 className="welcome-text">Clean Press Laundry <span className="text-black fw-bold"></span></h1>
              <h3 className="welcome-sub-text">Admin portal </h3>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            {/* Dropdown for selecting category */}
            <li className="nav-item dropdown d-none d-lg-block">
              <a className="nav-link dropdown-bordered dropdown-toggle dropdown-toggle-split" id="messageDropdown" href="#" data-bs-toggle="dropdown" aria-expanded="false">
                Select Category
              </a>
              <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list pb-0" aria-labelledby="messageDropdown">
                {/* Dropdown items */}
              </div>
            </li>
            {/* Datepicker */}
            <li className="nav-item d-none d-lg-block">
              <div id="datepicker-popup" className="input-group date datepicker navbar-date-picker">
                <span className="input-group-addon input-group-prepend border-right">
                  <span className="icon-calendar input-group-text calendar-icon"></span>
                </span>
                <input type="text" className="form-control" />
              </div>
            </li>
            {/* Search form */}
            <li className="nav-item">
              <form className="search-form" action="#">
                <i className="icon-search"></i>
                <input type="search" className="form-control" placeholder="Search Here" title="Search here" />
              </form>
            </li>
            {/* Notification dropdown */}
            <li className="nav-item dropdown">
              <a className="nav-link count-indicator" id="notificationDropdown" href="#" data-bs-toggle="dropdown">
                <i className="icon-bell"></i>
                <span className="count"></span>
              </a>
              <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list pb-0" aria-labelledby="notificationDropdown">
                {/* Notification dropdown content */}
              </div>
            </li>
            {/* Mail count dropdown */}
            <li className="nav-item dropdown">
              <a className="nav-link count-indicator" id="countDropdown" href="#" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="icon-mail icon-lg"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list pb-0" aria-labelledby="countDropdown">
                {/* Mail count dropdown content */}
              </div>
            </li>

          </ul>
          {/* Toggle button for smaller screens */}
          <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-bs-toggle="offcanvas">
            <span className="mdi mdi-menu"></span>
          </button>
        </div>
      </nav>
    );
  }
}

export default Header;

import React from 'react';

class LeftSidebar extends React.Component {
  render() {
    return (
      <nav className="sidebar sidebar-offcanvas" id="sidebar">
        <ul className="nav">
          <li className="nav-item">
            <a className="nav-link" href="#">
              <i className="mdi mdi-grid-large menu-icon"></i>
              <span className="menu-title">Dashboard</span>
            </a>
          </li>
          <li className="nav-item nav-category">Orders</li>
          <li className="nav-item">
            <a className="nav-link" data-bs-toggle="collapse" href="/orders" aria-expanded="false" aria-controls="">
              <i className="menu-icon mdi mdi-floor-plan"></i>
              <span className="menu-title">New Orders</span>
              <i className="menu-arrow"></i>
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" data-bs-toggle="collapse" href="#" aria-expanded="false" aria-controls="">
              <i className="menu-icon mdi mdi-floor-plan"></i>
              <span className="menu-title">Past Orders</span>
              <i className="menu-arrow"></i>
            </a>
          </li>

        </ul>
      </nav>
    );
  }
}

export default LeftSidebar;

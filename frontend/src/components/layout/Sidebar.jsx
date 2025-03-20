import React, { useState, useContext } from 'react';
import 'boxicons';
import './Sidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';


const Sidebar = () => {
  const [expenseToggle, setExpenseToggle] = useState(false);
  const [eventsToggle, setEventsToggle] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearUser();
    navigate('/login');
  };

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="logo_content">
        <div className="logo">
          {!collapsed && <div className="logo_name">Profile</div>}
        </div>
        <box-icon
          name="menu"
          color="#ffffff"
          onClick={() => setCollapsed(!collapsed)}
          style={{ cursor: 'pointer' }}
        ></box-icon>
      </div>
      <ul className="nav_list">
        {/* Dashboard */}
        <li>
          <NavLink to="/member-dashboard" className="nav_link">
            <box-icon name="grid-alt" color="#ffffff" type="solid"></box-icon>
            {!collapsed && <span className="Links_name">Dashboard</span>}
          </NavLink>
        </li>
        {/* Profile */}
        <li>
          <NavLink to="/member-dashboard/profile" className="nav_link">
            <box-icon name="user" color="#ffffff" type="solid"></box-icon>
            {!collapsed && <span className="Links_name">Profile</span>}
          </NavLink>
        </li>
        {/* Expense Tracker with dropdown */}
        <li>
          <div className="nav_link toggle_item" onClick={() => setExpenseToggle(!expenseToggle)}>
            <div className="left_content">
              <box-icon name="credit-card" rotate="180" color="#ffffff"></box-icon>
              {!collapsed && <span className="Links_name">Expense Tracker</span>}
            </div>
            {!collapsed && (
              <div className="right_arrow">
                <box-icon name={expenseToggle ? "chevron-down" : "chevron-right"} color="#ffffff"></box-icon>
              </div>
            )}
          </div>
          {!collapsed && expenseToggle && (
            <ul className="sub_menu">
              <li>
                <NavLink to="/member-dashboard/income" className="sub_link">
                  Income
                </NavLink>
              </li>
              <li>
                <NavLink to="/member-dashboard/expense" className="sub_link">
                  Expense
                </NavLink>
              </li>
              <li>
                <NavLink to="/member-dashboard/dashboard" className="sub_link">
                  Transactions
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        {/* Events with dropdown */}
        <li>
          <div className="nav_link toggle_item" onClick={() => setEventsToggle(!eventsToggle)}>
            <div className="left_content">
              <box-icon name="calendar-event" color="#ffffff"></box-icon>
              {!collapsed && <span className="Links_name">Events</span>}
            </div>
            {!collapsed && (
              <div className="right_arrow">
                <box-icon name={eventsToggle ? "chevron-down" : "chevron-right"} color="#ffffff"></box-icon>
              </div>
            )}
          </div>
          {!collapsed && eventsToggle && (
            <ul className="sub_menu">
              <li>
                <NavLink to="/member-dashboard/new-request" className="sub_link">
                  New Request
                </NavLink>
              </li>
              <li>
                <NavLink to="/member-dashboard/upcoming-events" className="sub_link">
                  Upcoming Events
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        {/* Calender */}
        <li>
          <NavLink to="/member-dashboard/calender" className="nav_link">
            <box-icon name="calendar-week" color="#ffffff"></box-icon>
            {!collapsed && <span className="Links_name">Calender</span>}
          </NavLink>
        </li>
        {/* Inbox */}
        <li>
          <NavLink to="/member-dashboard/inbox" className="nav_link">
            <box-icon name="message-square-dots" color="#ffffff"></box-icon>
            {!collapsed && <span className="Links_name">Inbox</span>}
          </NavLink>
        </li>
      </ul>
      {/* Logout at the bottom */}
      <div className="log_out">
        <button 
          className="nav_link logout_btn" 
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '10px', display: 'flex', alignItems: 'center', color: '#fff', cursor: 'pointer' }}
        >
          <box-icon name="log-out" color="#ffffff"></box-icon>
          {!collapsed && <span className="Links_name" style={{ marginLeft: '10px' }}>Log out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
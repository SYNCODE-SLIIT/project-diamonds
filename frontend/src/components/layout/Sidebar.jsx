import React, { useState, useEffect, useContext, useRef } from 'react';
import 'boxicons';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';

const Sidebar = () => {
  const [expenseToggle, setExpenseToggle] = useState(false);
  const [eventsToggle, setEventsToggle] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [hasRefunds, setHasRefunds] = useState(false);
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const lastTotalRef = useRef(0);

  // Fetch unread count initial and then poll
  useEffect(() => {
    let interval;
    const fetchTotal = async () => {
      try {
        // Fetch group chat unread counts
        const groupRes = await fetch(`http://localhost:4000/api/chat-groups/user/${user._id}`);
        const groupData = await groupRes.json();
        const unreadGroups = (groupData.groups || []).reduce((sum, g) => sum + (g.unreadCount || 0), 0);
        // Fetch direct chat unread counts
        const token = localStorage.getItem('token');
        const directRes = await fetch(`http://localhost:4000/api/direct-chats/user/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const directData = await directRes.json();
        const unreadDirect = (directData.threads || []).reduce((sum, t) => sum + (t.unreadCount || 0), 0);
        const total = unreadGroups + unreadDirect;
        if (total !== lastTotalRef.current) {
          setTotalUnread(total);
          lastTotalRef.current = total;
        }
      } catch (err) {
        console.error('Error fetching total unread:', err);
      }
    };
    if (user && user._id) {
      fetchTotal();
      interval = setInterval(fetchTotal, 3000);
    }
    return () => clearInterval(interval);
  }, [user]);

  // Fetch refund data to check if user has any refund requests
  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const response = await axiosInstance.get('/api/finance/getr');
        if (response.data && response.data.success) {
          const refunds = response.data.data || [];
          setHasRefunds(refunds.length > 0);
        } else {
          setHasRefunds(false);
        }
      } catch (error) {
        console.error("Error fetching refunds:", error);
        setHasRefunds(false);
      }
    };

    if (user && user._id) {
      fetchRefunds();
    }
  }, [user]);

  // Add a console log to check hasRefunds state
  useEffect(() => {
    console.log('hasRefunds state:', hasRefunds);
  }, [hasRefunds]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    clearUser();
    navigate('/login');
  };

  return (
    <div
      className={`
        fixed top-0 left-0 
        ${collapsed ? 'w-[80px]' : 'w-[250px]'} 
        h-full overflow-y-auto bg-[#1e1e2f] text-white 
        pt-[6px] pb-[6px] pl-[14px] pr-[14px] 
        shadow-[2px_0_12px_rgba(0,0,0,0.2)] 
        flex flex-col 
        transition-[width] duration-300 ease
      `}
    >
      <div className="flex items-center justify-between mb-[30px]">
        <div className="flex items-center">
          {!collapsed && (
            <div className="text-[22px] font-bold ml-[10px] transition-opacity duration-300 ease">
              Profile
            </div>
          )}
        </div>
        <box-icon
          name="menu"
          color="#ffffff"
          onClick={() => setCollapsed(!collapsed)}
          className="cursor-pointer"
        ></box-icon>
      </div>
      <ul className="list-none p-0 m-0">
        {/* Dashboard */}
        <li className="mb-[15px]">
          <NavLink
            to="/member-dashboard"
            end
            className={({ isActive }) =>
              `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
              flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
              transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
            }
          >
            <box-icon name="grid-alt" color="#ffffff" type="solid"></box-icon>
            {!collapsed && (
              <span className="ml-[10px] transition-opacity duration-300 ease">
                Dashboard
              </span>
            )}
          </NavLink>
        </li>
        {/* Expense Tracker with dropdown */}
        <li className="mb-[15px]">
          <div
            className="flex items-center justify-between cursor-pointer p-[10px] rounded-[8px] transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]"
            onClick={() => setExpenseToggle(!expenseToggle)}
          >
            <div className="flex items-center">
              <box-icon name="credit-card" rotate="180" color="#ffffff"></box-icon>
              {!collapsed && (
                <span className="ml-[10px] transition-opacity duration-300 ease">
                  Expense Tracker
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="ml-[10px]">
                <box-icon
                  name={expenseToggle ? "chevron-down" : "chevron-right"}
                  color="#ffffff"
                ></box-icon>
              </div>
            )}
          </div>
          {!collapsed && expenseToggle && (
            <ul className="list-none pl-[20px] transition-all duration-300 ease">
              <li className="mb-[15px]">
                <NavLink
                  to="/member-dashboard/dashboard"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Transactions
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/member-dashboard/income"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Income
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/member-dashboard/expense"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Expense
                </NavLink>
              </li>
              {hasRefunds && (
                <li className="mb-[15px]">
                  <NavLink
                    to="/member-dashboard/refund-history"
                    className={({ isActive }) =>
                      `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                      flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
                      transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                    }
                  >
                    Refund History
                  </NavLink>
                </li>
              )}
            </ul>
          )}
        </li>
        {/* Events with dropdown */}
        <li className="mb-[15px]">
          <div
            className="flex items-center justify-between cursor-pointer p-[10px] rounded-[8px] transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]"
            onClick={() => setEventsToggle(!eventsToggle)}
          >
            <div className="flex items-center">
              <box-icon name="calendar-event" color="#ffffff"></box-icon>
              {!collapsed && (
                <span className="ml-[10px] transition-opacity duration-300 ease">
                  Events
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="ml-[10px]">
                <box-icon
                  name={eventsToggle ? "chevron-down" : "chevron-right"}
                  color="#ffffff"
                ></box-icon>
              </div>
            )}
          </div>
          {!collapsed && eventsToggle && (
            <ul className="list-none pl-[20px] transition-all duration-300 ease">
              <li className="mb-[15px]">
                <NavLink
                  to="/member-dashboard/new-request"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  New Request
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/member-dashboard/upcoming-events"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Upcoming Events
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        {/* Calender */}
        <li className="mb-[15px]">
          <NavLink
            to="/member-dashboard/calender"
            className={({ isActive }) =>
              `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
              flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
              transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
            }
          >
            <box-icon name="calendar-week" color="#ffffff"></box-icon>
            {!collapsed && (
              <span className="ml-[10px] transition-opacity duration-300 ease">
                Calender
              </span>
            )}
          </NavLink>
        </li>
        {/* Inbox */}
        <li className="mb-[15px]">
          <NavLink
            to="/member-dashboard/inbox"
            className={({ isActive }) =>
              `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
              flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
              transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
            }
          >
            <box-icon name="message-square-dots" color="#ffffff"></box-icon>
            {!collapsed && (
              <span className="ml-[10px] transition-opacity duration-300 ease">
                Inbox
              </span>
            )}
            {!collapsed && totalUnread > 0 && (
              <span className="ml-auto bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                {totalUnread}
              </span>
            )}
          </NavLink>
        </li>
      </ul>
      
      {/* Profile and Logout */}
      <div className="mt-auto">
        <hr className="border-0 border-t border-t-[rgba(255,255,255,0.2)] my-[10px]" />
        <div>
          <NavLink
            to="/member-dashboard/profile"
            className={({ isActive }) =>
              `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
              flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px] 
              transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
            }
          >
            {user && user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="w-[24px] h-[24px] rounded-full"
              />
            ) : (
              <box-icon name="user" color="#ffffff" type="solid"></box-icon>
            )}
            {!collapsed && (
              <span className="ml-[10px] transition-opacity duration-300 ease">
                {user ? user.fullName : "Profile"}
              </span>
            )}
          </NavLink>
        </div>
        <div className="mt-auto mb-[20px] pt-[20px]">
          <button 
            className="flex items-center w-full text-left p-[10px] bg-transparent border-0 text-white cursor-pointer transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]"
            onClick={handleLogout}
          >
            <box-icon name="log-out" color="#ffffff"></box-icon>
            {!collapsed && (
              <span className="ml-[10px] transition-opacity duration-300 ease">
                Log out
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
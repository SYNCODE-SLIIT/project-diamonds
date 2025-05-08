import React, { useState, useEffect, useContext, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/userContext';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import 'boxicons';

const Sidebar = () => {
  // State management
  const [openSection, setOpenSection] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [hasRefunds, setHasRefunds] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // Add state for locked/selected state


  const refundFetchAttempted = useRef(false);

  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const lastTotalRef = useRef(0);
  const hoverTimerRef = useRef(null);
  const sidebarRef = useRef(null);

  // Fetch unread messages count
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

  // Fetch refund data
  useEffect(() => {
    const fetchRefunds = async () => {
      if (!user?._id) {
        console.log('No user ID, setting hasRefunds to false');
        setHasRefunds(false);
        return;
      }

      try {
        console.log('Fetching refunds for user:', user._id);
        const response = await axiosInstance.get('/api/finance/getr');
        console.log('Refund API response:', response.data);
        
        if (response.data?.success) {
          const refunds = response.data.data || [];
          // Filter refunds for current user only
          const userRefunds = refunds.filter(refund => refund.user._id === user._id);
          console.log('Found refunds for current user:', userRefunds.length);
          setHasRefunds(userRefunds.length > 0);
        } else {
          console.log('No success in response, setting hasRefunds to false');
          setHasRefunds(false);
        }
      } catch (error) {
        console.error("Error fetching refunds:", error);
        setHasRefunds(false);
      }
    };

    // Only fetch if we haven't attempted yet
    if (!refundFetchAttempted.current) {
      fetchRefunds();
    }

    return () => {
      refundFetchAttempted.current = false;
    };
  }, [user]);

  // Toggle section open/closed
  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Debug effect to track state changes
  useEffect(() => {
    console.log('hasRefunds changed to:', hasRefunds, 'User:', user?._id);
  }, [hasRefunds, user]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      setHasRefunds(false);
      refundFetchAttempted.current = false;
    };
  }, []);


  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    clearUser();
    navigate('/login');
  };

  // Mouse enter/leave handlers for hover expansion
  const handleMouseEnter = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsHovering(true);
    
    // Don't auto-expand if explicitly locked or collapsed
    if (!isExpanded && !isLocked) {
      hoverTimerRef.current = setTimeout(() => {
        setIsExpanded(true);
      }, 0); // Slight delay before expanding
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsHovering(false);
    
    // Only auto-collapse if it was expanded by hover and not locked
    if (isExpanded && !isLocked) {
      hoverTimerRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 50); // Slight delay before collapsing
    }
  };

  // Toggle sidebar lock/unlock
  const toggleSidebar = () => {
    // compute the next locked state
    const newLockedState = !isLocked;
    setIsLocked(newLockedState);

    // when locking, force the sidebar open
    // when unlocking, collapse only if the cursor isn't currently hovering
    if (newLockedState) {
      setIsExpanded(true);
    } else if (!isHovering) {
      setIsExpanded(false);
    }

    // reflect the lock state on the DOM element for external selectors
    if (sidebarRef.current) {
      if (newLockedState) {
        sidebarRef.current.classList.add('sidebar-locked');
      } else {
        sidebarRef.current.classList.remove('sidebar-locked');
      }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isExpanded && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => {
            // Only close if not locked
            if (!isLocked) {
              setIsExpanded(false);
            }
          }}
        />
      )}
      
      {/* Main sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          fixed top-0 left-0 h-full z-50
          ${isExpanded ? 'w-64' : 'w-22'} 
          bg-gradient-to-b from-[#1E0B32] to-[#25105A]
          transition-all duration-300 ease-in-out
          shadow-[0_0_30px_rgba(0,0,0,0.25)]
          overflow-hidden
        `}
      >
        {/* Header with toggle button */}
        <div
          className={`
            h-16 flex items-center
            ${isExpanded ? 'px-6' : 'px-6'}
            border-b border-pink-400/30
          `}
        >
          <button
            onClick={toggleSidebar}
            className={`
     flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full
     text-gray-400 hover:text-white
     ${isLocked 
       ? 'bg-purple-500/20 text-white' 
       : 'hover:bg-purple-500/20'}
     transition-all duration-200
   `}
            title={isLocked ? 'Unlock sidebar' : 'Lock sidebar open'}
            aria-label={isLocked ? 'Unlock sidebar' : 'Lock sidebar open'}
          >
            <box-icon name="menu" color="currentColor" size="sm"></box-icon>
          </button>
          
          <div className={`ml-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <h1 className="text-white font-semibold text-lg">Team Diamonds</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="pt-4 pb-4 h-[calc(100%-4rem)] flex flex-col">
          <div className="space-y-3 px-3 overflow-y-auto scrollbar-thin">
            {/* Dashboard */}
            <NavLink
              to="/member-dashboard"
              end
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-xl
                ${isActive 
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/20 text-white font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'}
                group transition-all duration-200 relative
              `}
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                <box-icon name="grid-alt" type="solid" color="currentColor"></box-icon>
                <span className="absolute inset-0 rounded-lg group-hover:bg-pink-500/10 transition-colors duration-200"></span>
              </div>
              
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Dashboard
              </span>
            </NavLink>

            {/* Expense Tracker Menu Group */}
            <div className="relative">
              <button
                onClick={() => toggleSection('expense')}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                  ${openSection === 'expense' 
                    ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/20 text-white font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'}
                  group transition-all duration-200
                `}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                    <box-icon name="credit-card" rotate="180" color="currentColor"></box-icon>
                    <span className="absolute inset-0 rounded-lg group-hover:bg-pink-500/10 transition-colors duration-200"></span>
                  </div>
                  
                  <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    Expense Tracker
                  </span>
                </div>
                
                {isExpanded && (
                  <span className={`transition-transform duration-200 ${openSection === 'expense' ? 'rotate-180' : ''}`}>
                    <box-icon name="chevron-down" color="currentColor" size="sm"></box-icon>
                  </span>
                )}
              </button>
              
              {/* Expense Tracker Dropdown */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'expense' && isExpanded ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <ul className="pl-12 pr-3 pb-1 space-y-1">
                  <li>
                    <NavLink
                      to="/member-dashboard/dashboard"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-pink-500/10 text-pink-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Transactions
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/member-dashboard/income"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-pink-500/10 text-pink-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Income
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/member-dashboard/expense"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-pink-500/10 text-pink-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Expense
                    </NavLink>
                  </li>
                  {hasRefunds && (
                    <li>
                      <NavLink
                        to="/member-dashboard/refund-history"
                        className={({ isActive }) => `
                          block py-2 px-3 rounded-lg text-sm
                          ${isActive ? 'bg-pink-500/10 text-pink-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                          transition-colors duration-200
                        `}
                      >
                        Refund History
                      </NavLink>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Events Menu Group */}
            <div className="relative">
              <button
                onClick={() => toggleSection('events')}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                  ${openSection === 'events' ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/20 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                  group transition-all duration-200
                `}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                    <box-icon name="calendar-event" type="solid" color="currentColor"></box-icon>
                    <span className="absolute inset-0 rounded-lg group-hover:bg-pink-500/10 transition-colors duration-200"></span>
                  </div>
                  
                  <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    Events
                  </span>
                </div>
                
                {isExpanded && (
                  <box-icon 
                    name={openSection === 'events' ? 'chevron-up' : 'chevron-down'} 
                    color="currentColor"
                    className="transition-transform duration-200"
                  ></box-icon>
                )}
              </button>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSection === 'events' && isExpanded ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                <ul className="pl-12 pr-3 pb-1 space-y-1">
                  <li>
                    <NavLink
                      to="/member-dashboard/new-request"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-pink-500/10 text-pink-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      New Request
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/member-dashboard/upcoming-events"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-pink-500/10 text-pink-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Upcoming Events
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/member-dashboard/practices"
                      className={({ isActive }) => `
                        block py-2 px-3 rounded-lg text-sm
                        ${isActive ? 'bg-pink-500/10 text-pink-300' : 'text-gray-300 hover:text-white hover:bg-white/5'}
                        transition-colors duration-200
                      `}
                    >
                      Practices
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>

            {/* Calendar */}
            <NavLink
              to="/member-dashboard/calender"
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-xl
                ${isActive 
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/20 text-white font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'}
                group transition-all duration-200
              `}
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                <box-icon name="calendar-week" color="currentColor"></box-icon>
                <span className="absolute inset-0 rounded-lg group-hover:bg-pink-500/10 transition-colors duration-200"></span>
              </div>
              
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Calendar
              </span>
            </NavLink>

            {/* Inbox with notification badge */}
            <NavLink
              to="/member-dashboard/inbox"
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-xl
                ${isActive 
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/20 text-white font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'}
                group transition-all duration-200 relative
              `}
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                <box-icon name="message-square-dots" color="currentColor"></box-icon>
                <span className="absolute inset-0 rounded-lg group-hover:bg-pink-500/10 transition-colors duration-200"></span>
              </div>
              
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Inbox
              </span>
              
              {totalUnread > 0 && (
                <span className={`
                  flex items-center justify-center min-w-[20px] h-5 text-xs font-medium text-white 
                  bg-pink-500 rounded-full absolute
                  ${isExpanded ? 'right-3' : 'top-1 right-2'}
                  transition-all duration-300
                `}>
                  {totalUnread}
                </span>
              )}
            </NavLink>
          </div>

          {/* Profile and Logout */}
          <div className="mt-auto pt-3 border-t border-pink-400/30 px-3">
            <NavLink
              to="/member-dashboard/profile"
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-xl mb-1
                ${isActive 
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/20 text-white font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'}
                group transition-all duration-200
              `}
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                {user && user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover border border-purple-700"
                  />
                ) : (
                  <box-icon name="user" type="solid" color="currentColor"></box-icon>
                )}
                <span className="absolute inset-0 rounded-lg group-hover:bg-pink-500/10 transition-colors duration-200"></span>
              </div>
              
              <span className={`ml-3 whitespace-nowrap truncate transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto max-w-[120px]' : 'opacity-0 w-0'}`}>
                {user ? user.fullName : "Profile"}
              </span>
            </NavLink>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-red-500/10 group transition-all duration-200"
            >
              <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center relative">
                <box-icon name="log-out" color="currentColor"></box-icon>
                <span className="absolute inset-0 rounded-lg group-hover:bg-red-500/10 transition-colors duration-200"></span>
              </div>
              
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                Log out
              </span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
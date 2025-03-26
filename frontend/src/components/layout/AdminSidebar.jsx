import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'boxicons';

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userMgmtToggle, setUserMgmtToggle] = useState(false);
  const [mediaMgmtToggle, setMediaMgmtToggle] = useState(false);
  const [eventMgmtToggle, setEventMgmtToggle] = useState(false);
  const [teamMgmtToggle, setTeamMgmtToggle] = useState(false);

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div
      className={`
        fixed top-0 left-0 
        ${collapsed ? 'w-[80px]' : 'w-[250px]'} 
        h-full bg-[#1e1e2f] text-white 
        pt-[6px] pb-[6px] pl-[14px] pr-[14px] 
        shadow-[2px_0_12px_rgba(0,0,0,0.2)] 
        flex flex-col 
        transition-[width] duration-300 ease
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-[30px]">
        <div className="flex items-center">
          {!collapsed && (
            <div className="text-[22px] font-bold ml-[10px] transition-opacity duration-300 ease">
              Admin Panel
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
        {/* User Management */}
        <li className="mb-[15px]">
          <div
            className="flex items-center justify-between cursor-pointer p-[10px] rounded-[8px] transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]"
            onClick={() => setUserMgmtToggle(!userMgmtToggle)}
          >
            <div className="flex items-center">
              <box-icon name="user" color="#ffffff"></box-icon>
              {!collapsed && (
                <span className="ml-[10px] transition-opacity duration-300 ease">
                  User Management
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="ml-[10px]">
                <box-icon
                  name={userMgmtToggle ? "chevron-down" : "chevron-right"}
                  color="#ffffff"
                ></box-icon>
              </div>
            )}
          </div>
          {!collapsed && userMgmtToggle && (
            <ul className="list-none pl-[20px] transition-all duration-300 ease">
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/applications/combined"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Applications
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/members"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Members
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/organizers"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Organizers
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Financial Management */}
        <li className="mb-[15px]">
          <NavLink
            to="/financial"
            className={({ isActive }) =>
              `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
              flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
              transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
            }
          >
            <box-icon name="dollar" color="#ffffff"></box-icon>
            {!collapsed && (
              <span className="ml-[10px] transition-opacity duration-300 ease">
                Financial Management
              </span>
            )}
          </NavLink>
        </li>

        {/* Media Management */}
        <li className="mb-[15px]">
          <div
            className="flex items-center justify-between cursor-pointer p-[10px] rounded-[8px] transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]"
            onClick={() => setMediaMgmtToggle(!mediaMgmtToggle)}
          >
            <div className="flex items-center">
              <box-icon name="video" color="#ffffff"></box-icon>
              {!collapsed && (
                <span className="ml-[10px] transition-opacity duration-300 ease">
                  Media Management
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="ml-[10px]">
                <box-icon
                  name={mediaMgmtToggle ? "chevron-down" : "chevron-right"}
                  color="#ffffff"
                ></box-icon>
              </div>
            )}
          </div>
          {!collapsed && mediaMgmtToggle && (
            <ul className="list-none pl-[20px] transition-all duration-300 ease">
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/blog-posts"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Blog Posts
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/media"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Media
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/collaboration"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Collaboration
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/content"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Content
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/merchandise"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Merchandise
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Event Management */}
        <li className="mb-[15px]">
          <div
            className="flex items-center justify-between cursor-pointer p-[10px] rounded-[8px] transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]"
            onClick={() => setEventMgmtToggle(!eventMgmtToggle)}
          >
            <div className="flex items-center">
              <box-icon name="calendar" color="#ffffff"></box-icon>
              {!collapsed && (
                <span className="ml-[10px] transition-opacity duration-300 ease">
                  Event Management
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="ml-[10px]">
                <box-icon
                  name={eventMgmtToggle ? "chevron-down" : "chevron-right"}
                  color="#ffffff"
                ></box-icon>
              </div>
            )}
          </div>
          {!collapsed && eventMgmtToggle && (
            <ul className="list-none pl-[20px] transition-all duration-300 ease">
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/packages"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Packages
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/services"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Additional Services
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/events"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Events
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Team Management */}
        <li className="mb-[15px]">
          <div
            className="flex items-center justify-between cursor-pointer p-[10px] rounded-[8px] transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]"
            onClick={() => setTeamMgmtToggle(!teamMgmtToggle)}
          >
            <div className="flex items-center">
              <box-icon name="group" color="#ffffff"></box-icon>
              {!collapsed && (
                <span className="ml-[10px] transition-opacity duration-300 ease">
                  Team Management
                </span>
              )}
            </div>
            {!collapsed && (
              <div className="ml-[10px]">
                <box-icon
                  name={teamMgmtToggle ? "chevron-down" : "chevron-right"}
                  color="#ffffff"
                ></box-icon>
              </div>
            )}
          </div>
          {!collapsed && teamMgmtToggle && (
            <ul className="list-none pl-[20px] transition-all duration-300 ease">
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/event-assignments"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Event Assignments
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/practice-assignments"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Practice Assignments
                </NavLink>
              </li>
              <li className="mb-[15px]">
                <NavLink
                  to="/admin/team-calendar"
                  className={({ isActive }) =>
                    `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
                    flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
                    transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
                  }
                >
                  Calendar
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Inbox */}
        <li className="mb-[15px]">
          <NavLink
            to="/admin/inbox"
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
          </NavLink>
        </li>
      </ul>

      {/* Footer (Profile & Logout) */}
      <div className="mt-auto">
        <hr className="border-0 border-t border-t-[rgba(255,255,255,0.2)] my-[10px]" />
        <div>
          <NavLink
            to="/admin/profile"
            className={({ isActive }) =>
              `${isActive ? 'bg-[rgba(79,70,229,0.25)] font-bold' : ''} 
              flex items-center gap-[10px] text-white no-underline text-[16px] p-[10px] rounded-[8px]
              transition-colors duration-300 ease hover:bg-[rgba(79,70,229,0.15)]`
            }
          >
            <box-icon name="user" color="#ffffff"></box-icon>
            {!collapsed && (
              <span className="ml-[10px] transition-opacity duration-300 ease">
                Admin Profile
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

export default AdminSidebar;
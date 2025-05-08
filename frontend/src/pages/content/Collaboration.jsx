import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axiosInstance from '../../utils/axiosInstance';
import { FaUserPlus, FaChartLine, FaCalendarAlt, FaTasks, FaComments, FaFileContract, FaBell, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Collaboration = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', accessDuration: '', status: 'Pending' });
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New collaboration request from John Doe', time: '5 minutes ago', read: false },
    { id: 2, message: 'Access duration expiring for Sarah Smith', time: '2 hours ago', read: false },
    { id: 3, message: 'New task assigned: Content Review', time: '1 day ago', read: true }
  ]);

  const fetchCollaborators = async () => {
    try {
      const res = await axiosInstance.get('/api/collaborators');
      setCollaborators(res.data);
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(`/api/collaborators/${editId}`, form);
      } else {
        await axiosInstance.post('/api/add-collaborator', form);
      }
      setForm({ name: '', role: '', accessDuration: '', status: 'Pending' });
      setEditId(null);
      fetchCollaborators();
    } catch (error) {
      console.error('Error submitting collaborator:', error);
    }
  };

  const handleEdit = (collab) => {
    setForm({ name: collab.name, role: collab.role, accessDuration: collab.accessDuration, status: collab.status });
    setEditId(collab._id);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/collaborators/${id}`);
      fetchCollaborators();
    } catch (error) {
      console.error('Error deleting collaborator:', error);
    }
  };

  const downloadCSV = () => {
    const data = collaborators.map(c => ({
      Name: c.name,
      Role: c.role,
      'Access Duration': c.accessDuration,
      Status: c.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Collaborators');
    XLSX.writeFile(wb, 'collaborators_report.csv');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Collaborators Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    // Add overview stats
    doc.setFontSize(12);
    doc.text('Overview', 14, 35);
    doc.setFontSize(10);
    doc.text(`Total Collaborators: ${collaborators.length}`, 14, 45);
    doc.text(`Active Projects: 8`, 14, 50);
    doc.text(`Pending Requests: 5`, 14, 55);
    doc.text(`Engagement Rate: 87%`, 14, 60);

    // Add collaborators table
    const tableData = collaborators.map(c => [
      c.name,
      c.role,
      c.accessDuration,
      c.status
    ]);

    doc.autoTable({
      head: [['Name', 'Role', 'Access Duration', 'Status']],
      body: tableData,
      startY: 70,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202]
      }
    });

    // Add charts
    const roleChart = document.querySelector('.echarts-for-react');
    if (roleChart) {
      const roleChartImg = roleChart.toDataURL('image/png');
      doc.addImage(roleChartImg, 'PNG', 14, doc.lastAutoTable.finalY + 10, 90, 60);
    }

    doc.save('collaborators_report.pdf');
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total Collaborators</p>
            <h3 className="text-2xl font-bold">{collaborators.length}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <FaUserPlus className="text-blue-600 text-xl" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-green-600">↑ 12% from last month</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">Active Projects</p>
            <h3 className="text-2xl font-bold">8</h3>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <FaTasks className="text-purple-600 text-xl" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-green-600">↑ 3 new this week</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">Pending Requests</p>
            <h3 className="text-2xl font-bold">5</h3>
          </div>
          <div className="bg-yellow-100 p-3 rounded-full">
            <FaBell className="text-yellow-600 text-xl" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-yellow-600">2 require immediate attention</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">Engagement Rate</p>
            <h3 className="text-2xl font-bold">87%</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <FaChartLine className="text-green-600 text-xl" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-green-600">↑ 5% from last month</p>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Collaboration Tasks</h2>
      <div className="space-y-4">
        {[
          { title: 'Content Review', assignee: 'John Doe', deadline: '2024-03-20', status: 'In Progress' },
          { title: 'Video Editing', assignee: 'Sarah Smith', deadline: '2024-03-22', status: 'Pending' },
          { title: 'Social Media Posts', assignee: 'Mike Johnson', deadline: '2024-03-25', status: 'Completed' }
        ].map((task, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-600">Assigned to: {task.assignee}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Due: {task.deadline}</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Collaboration Calendar</h2>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 p-2">
            {day}
          </div>
        ))}
        {Array.from({ length: 31 }, (_, i) => (
          <div key={i} className="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="text-sm font-medium">{i + 1}</div>
            {i % 5 === 0 && (
              <div className="mt-1">
                <div className="text-xs bg-blue-100 text-blue-800 rounded p-1 mb-1">Meeting</div>
                <div className="text-xs bg-green-100 text-green-800 rounded p-1">Deadline</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Active Contracts</h2>
      <div className="space-y-4">
        {[
          { title: 'Content Creation Agreement', party: 'John Doe', startDate: '2024-03-01', endDate: '2024-06-01', status: 'Active' },
          { title: 'Video Production Contract', party: 'Sarah Smith', startDate: '2024-02-15', endDate: '2024-05-15', status: 'Active' },
          { title: 'Social Media Management', party: 'Mike Johnson', startDate: '2024-03-10', endDate: '2024-09-10', status: 'Pending' }
        ].map((contract, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <h3 className="font-semibold">{contract.title}</h3>
              <p className="text-sm text-gray-600">With: {contract.party}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <p>Start: {contract.startDate}</p>
                <p>End: {contract.endDate}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                contract.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {contract.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Search, Notifications, and Download */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search collaborators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <button
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaDownload />
              <span>Download</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-50">
              <button
                onClick={downloadPDF}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Download as PDF
              </button>
              <button
                onClick={downloadCSV}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Download as CSV
              </button>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FaBell className="text-xl" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-50">
                <h3 className="font-semibold mb-2">Notifications</h3>
                <div className="space-y-2">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-2 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                    >
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'contracts'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Contracts
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'tasks' && renderTasks()}
      {activeTab === 'calendar' && renderCalendar()}
      {activeTab === 'contracts' && renderContracts()}

      {/* Existing Form and Collaborators List */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Collaborator</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 w-full" required />
          <select name="role" value={form.role} onChange={handleChange} className="border p-2 w-full" required>
            <option value="">Select Role</option>
            <option value="Content Editor">Content Editor</option>
            <option value="Merchandise Manager">Merchandise Manager</option>
            <option value="Sponsorship Coordinator">Sponsorship Coordinator</option>
            <option value="Dancing Choreographer">Dancing Choreographer</option>
          </select>
          <select name="accessDuration" value={form.accessDuration} onChange={handleChange} className="border p-2 w-full" required>
            <option value="">Select Duration</option>
            <option value="1 month">1 month</option>
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="1 year">1 year</option>
            <option value="Until project ends">Until project ends</option>
          </select>
          <select name="status" value={form.status} onChange={handleChange} className="border p-2 w-full">
            <option>Pending</option>
            <option>Active</option>
            <option>Expired</option>
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            {editId ? 'Update' : 'Add'}
          </button>
        </form>
      </div>

      {/* Existing Collaborators List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {collaborators.map(c => (
          <div key={c._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold">{c.name}</h3>
              <p className="text-gray-600 mt-1">Role: {c.role}</p>
              <p className="text-gray-600">Access: {c.accessDuration}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                c.status === 'Active' ? 'bg-green-100 text-green-800' :
                c.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {c.status}
              </span>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(c)} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Existing Charts */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Role Distribution</h3>
          <ReactECharts
            option={{
              tooltip: { trigger: 'item' },
              legend: { orient: 'vertical', left: 'left' },
              series: [
                {
                  name: 'Roles',
                  type: 'pie',
                  radius: '50%',
                  data: collaborators.reduce((acc, c) => {
                    const found = acc.find(x => x.name === c.role);
                    if (found) found.value++;
                    else acc.push({ name: c.role, value: 1 });
                    return acc;
                  }, []),
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }
                }
              ]
            }}
            style={{ height: '300px' }}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Access Duration Distribution</h3>
          <ReactECharts
            option={{
              tooltip: { trigger: 'axis' },
              xAxis: {
                type: 'category',
                data: Object.keys(
                  collaborators.reduce((acc, c) => {
                    acc[c.accessDuration] = (acc[c.accessDuration] || 0) + 1;
                    return acc;
                  }, {})
                )
              },
              yAxis: { type: 'value' },
              series: [
                {
                  name: 'Count',
                  type: 'bar',
                  data: Object.values(
                    collaborators.reduce((acc, c) => {
                      acc[c.accessDuration] = (acc[c.accessDuration] || 0) + 1;
                      return acc;
                    }, {})
                  )
                }
              ]
            }}
            style={{ height: '300px' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Collaboration;

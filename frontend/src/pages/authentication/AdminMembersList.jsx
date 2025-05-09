import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, subMonths } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminMembersList = () => {
  const [members, setMembers] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, newLastMonth: 0, chartData: [] });

  useEffect(() => {
    fetch('http://localhost:4000/api/users')
      .then(res => res.json())
      .then(data => {
        // Assuming data is an array of users
        if (Array.isArray(data)) {
          // Filter only those with role "member"
          const filtered = data.filter(user => user.role === 'member');
          setMembers(filtered);

          // Compute analytics stats
          const total = filtered.length;
          const oneMonthAgo = subMonths(new Date(), 1);
          const newLastMonth = filtered.filter(user => new Date(user.createdAt) >= oneMonthAgo).length;
          const months = Array.from({ length: 6 }).map((_, i) => format(subMonths(new Date(), 5 - i), 'MMM'));
          const chartData = months.map(monthLabel => ({
            month: monthLabel,
            count: filtered.filter(user => format(new Date(user.createdAt), 'MMM') === monthLabel).length
          }));
          setStats({ total, newLastMonth, chartData });
        } else {
          setErrorMsg("Unexpected data format");
        }
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Error fetching members: " + err.message);
        setLoading(false);
      });
  }, []);

  // Function to update stats after deletion
  const updateStatsAfterDeletion = (filteredMembers) => {
    const total = filteredMembers.length;
    const oneMonthAgo = subMonths(new Date(), 1);
    const newLastMonth = filteredMembers.filter(user => new Date(user.createdAt) >= oneMonthAgo).length;
    const months = Array.from({ length: 6 }).map((_, i) => format(subMonths(new Date(), 5 - i), 'MMM'));
    const chartData = months.map(monthLabel => ({
      month: monthLabel,
      count: filteredMembers.filter(user => format(new Date(user.createdAt), 'MMM') === monthLabel).length
    }));
    setStats({ total, newLastMonth, chartData });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member? This will also remove their associated application."
    );
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(`http://localhost:4000/api/users/members/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        // Remove deleted member from the list and update stats
        const updatedMembers = members.filter(member => member._id !== id);
        setMembers(updatedMembers);
        updateStatsAfterDeletion(updatedMembers);
      } else {
        alert(data.message || 'Error deleting member.');
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Export member list as CSV
  const handleExportCSV = () => {
    const headers = ['Full Name', 'Email', 'Joined Date'];
    const rows = members.map(m => [
      m.fullName,
      m.email,
      m.createdAt ? format(new Date(m.createdAt), 'yyyy-MM-dd') : ''
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'members.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] p-6">
          <h2 className="text-3xl font-bold text-center text-white">Members Management</h2>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1c4b82]"></div>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-center">
            {errorMsg}
          </div>
        )}
        {!loading && members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-xl">No members found.</p>
          </div>
        )}
        {!loading && members.length > 0 && (
          <>
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow-lg rounded-xl p-4 border-l-4 border-[#1c4b82] transition-transform hover:scale-105 duration-300">
                  <div className="flex items-center">
                    <div className="bg-blue-50 p-2 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#1c4b82]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Total Members</h3>
                      <p className="text-2xl font-bold text-[#1c4b82]">{stats.total}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-xl p-4 border-l-4 border-emerald-500 transition-transform hover:scale-105 duration-300">
                  <div className="flex items-center">
                    <div className="bg-emerald-50 p-2 rounded-full mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700">Joined Last Month</h3>
                      <p className="text-2xl font-bold text-emerald-600">{stats.newLastMonth}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-[#1c4b82] transition-transform hover:scale-102 duration-300">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Membership Growth Trend</h3>
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={stats.chartData}>
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 12, fill: '#6B7280' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderRadius: '8px', 
                          border: '1px solid #E5E7EB',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#1c4b82" 
                        strokeWidth={3} 
                        dot={{ fill: '#0d253f', strokeWidth: 2, r: 4 }}
                        activeDot={{ fill: '#0d253f', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-end gap-4 mb-4">
                <button 
                  onClick={handleExportCSV} 
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-[#0d253f] to-[#1c4b82] text-white rounded-lg shadow-md hover:opacity-90 transition-all transform hover:scale-105 duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Export Members CSV
                </button>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Member List</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      View Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map(member => (
                    <tr key={member._id} className="hover:bg-gray-50 transition duration-300 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/admin/finalized/${member.profileId}`}
                          className="bg-gradient-to-r from-[#0d253f] to-[#1c4b82] text-white px-4 py-2 rounded-md hover:opacity-90 transition duration-300"
                        >
                          View Details
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => handleDelete(member._id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMembersList;
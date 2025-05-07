import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axiosInstance from '../../utils/axiosInstance';

const Collaboration = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [form, setForm] = useState({ name: '', role: '', accessDuration: '', status: 'Pending' });
  const [editId, setEditId] = useState(null);

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

  // Function to download the collaborators report
  const downloadCollaboratorsReport = async () => {
    try {
      const res = await axiosInstance.get('/api/collaborators/report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Collaborators_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading collaborators report:', err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Form card */}
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
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{editId ? 'Update' : 'Add'}</button>
        </form>
      </div>

      <h2 className="text-xl font-semibold mb-2">Collaborators List</h2>
      <button onClick={downloadCollaboratorsReport} className="bg-green-500 text-white px-4 py-2 rounded mb-4">
        Download Collaborators Report
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {collaborators.map(c => (
          <div key={c._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold">{c.name}</h3>
              <p className="text-gray-600 mt-1">Role: {c.role}</p>
              <p className="text-gray-600">Access: {c.accessDuration}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${c.status === 'Active' ? 'bg-green-100 text-green-800' : c.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
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

      {/* Pie Chart for Role Distribution */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Role Distribution</h3>
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

      {/* Bar Chart for Access Duration Distribution */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Access Duration Distribution</h3>
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
  );
};

export default Collaboration;

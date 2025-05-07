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

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Collaborator</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
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

      <h2 className="text-xl font-semibold mb-2">Collaborators List</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Access</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {collaborators.map(c => (
            <tr key={c._id}>
              <td className="p-2 border">{c.name}</td>
              <td className="p-2 border">{c.role}</td>
              <td className="p-2 border">{c.accessDuration}</td>
              <td className="p-2 border">{c.status}</td>
              <td className="p-2 border space-x-2">
                <button onClick={() => handleEdit(c)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

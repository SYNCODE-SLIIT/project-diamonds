import React, { useEffect, useState } from 'react';
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
    setForm(collab);
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
        <input type="text" name="role" value={form.role} onChange={handleChange} placeholder="Role" className="border p-2 w-full" required />
        <input type="text" name="accessDuration" value={form.accessDuration} onChange={handleChange} placeholder="Access Duration" className="border p-2 w-full" required />
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
    </div>
  );
};

export default Collaboration;

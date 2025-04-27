import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = '/api/merchandise';

const emptyForm = {
  name: '',
  price: '',
  image: '',
  description: '',
  category: '',
  inStock: true,
};

const MerchandiseAdmin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setItems(res.data);
    } catch (err) {
      setError('Failed to fetch merchandise');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };
  const openEdit = (item) => {
    setForm({ ...item });
    setEditId(item._id);
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const config = getAuthConfig();
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('price', form.price);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('inStock', form.inStock);
      if (imageFile) formData.append('image', imageFile);
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData, config);
      } else {
        await axios.post(API_URL, formData, config);
      }
      fetchItems();
      closeForm();
      setImageFile(null);
    } catch (err) {
      setError('Failed to save merchandise');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const config = getAuthConfig();
      await axios.delete(`${API_URL}/${id}`, config);
      fetchItems();
    } catch (err) {
      setError('Failed to delete merchandise');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Merchandise Admin Panel</h2>
      <button onClick={openAdd} className="mb-4 bg-green-600 text-white px-4 py-2 rounded">Add Merchandise</button>
      {loading ? <div>Loading...</div> : error ? <div className="text-red-500">{error}</div> : (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Image</th>
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Category</th>
              <th className="p-2">In Stock</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id} className="border-b">
                <td className="p-2"><img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded" /></td>
                <td className="p-2">{item.name}</td>
                <td className="p-2">${item.price}</td>
                <td className="p-2">{item.category}</td>
                <td className="p-2">{item.inStock ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  <button onClick={() => openEdit(item)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow-lg w-full max-w-md relative">
            <button onClick={closeForm} className="absolute top-2 right-2 text-gray-500">✖</button>
            <h3 className="text-xl font-bold mb-4">{editId ? 'Edit' : 'Add'} Merchandise</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block mb-1">Price</label>
                <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block mb-1">Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block mb-1">Category</label>
                <input name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex items-center">
                <input name="inStock" type="checkbox" checked={form.inStock} onChange={handleChange} className="mr-2" />
                <label>In Stock</label>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchandiseAdmin; 
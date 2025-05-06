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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('priceAsc');

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

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'All' || item.category === selectedCategory)
  );
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === 'priceAsc') return a.price - b.price;
    if (sortOrder === 'priceDesc') return b.price - a.price;
    if (sortOrder === 'nameAsc') return a.name.localeCompare(b.name);
    if (sortOrder === 'nameDesc') return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Merchandise Admin Panel</h2>
      <button onClick={openAdd} className="mb-4 bg-green-600 text-white px-4 py-2 rounded">Add Merchandise</button>
      <div className="flex flex-wrap items-center mb-4 space-x-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] p-2 border rounded"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="p-2 border rounded"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="nameAsc">Name: A-Z</option>
          <option value="nameDesc">Name: Z-A</option>
        </select>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {sortedItems.map(item => (
            <div key={item._id} className="bg-white shadow-md rounded-lg overflow-hidden">
              <img src={item.image} alt={item.name} className="h-48 w-full object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold truncate">{item.name}</h3>
                  <span className={`px-2 py-1 text-sm rounded-full ${
                    item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <p className="text-gray-500 truncate">{item.category}</p>
                <div className="mt-2">
                  <span className="text-xl font-bold">${item.price}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button onClick={() => openEdit(item)} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
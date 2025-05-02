import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../../components/Modal';
import MerchandisePaymentForm from '../../components/Merchandise/MerchandisePaymentForm';

const MerchandiseStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', image: '', description: '' });
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/merchandise');
      setProducts(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add or update product
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'add') {
        await axios.post('/api/merchandise', form);
      } else if (formMode === 'edit' && editProduct) {
        await axios.put(/api/merchandise/${editProduct._id}, form);
      }
      setForm({ name: '', price: '', image: '', description: '' });
      setFormMode('add');
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      setError('Failed to save merchandise');
    }
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      image: product.image || '',
      description: product.description || '',
    });
    setFormMode('edit');
    setEditProduct(product);
  };

  // Delete product
  const handleDelete = async (product) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(/api/merchandise/${product._id});
        fetchProducts();
      } catch (err) {
        setError('Failed to delete merchandise');
      }
    }
  };

  // Open buy modal
  const handleBuy = (product) => {
    setSelectedProduct(product);
    setBuyModalOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Merchandise Store</h2>
      {/* Merchandise Table */}
      <div className="bg-white rounded-lg shadow-md p-4 max-w-4xl mx-auto">
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-lg font-semibold">No products found.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Image</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="text-center">
                  <td className="p-2 border">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover mx-auto rounded" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="p-2 border font-semibold">{product.name}</td>
                  <td className="p-2 border">${product.price}</td>
                  <td className="p-2 border">{product.description || '-'}</td>
                  <td className="p-2 border flex flex-col gap-2 items-center">
                    <button onClick={() => handleBuy(product)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition mb-1">Buy</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Payment Modal */}
      <Modal isOpen={buyModalOpen} onClose={() => setBuyModalOpen(false)} title="Buy Merchandise">
        {selectedProduct && (
          <MerchandisePaymentForm product={selectedProduct} onClose={() => setBuyModalOpen(false)} />
        )}
      </Modal>
    </div>
  );
};

export default MerchandiseStore;
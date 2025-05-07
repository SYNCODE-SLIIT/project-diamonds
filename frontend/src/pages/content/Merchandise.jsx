import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MerchandiseModal from './MerchandiseModal';
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
  const [confirmation, setConfirmation] = useState(null);

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
        await axios.put(`/api/merchandise/${editProduct._id}`, form);
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
        await axios.delete(`/api/merchandise/${product._id}`);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex flex-col items-center">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <h3 className="text-xl font-bold mt-4 text-center">{product.name}</h3>
                <p className="text-lg text-green-600 mt-2">${product.price}</p>
                <p className="text-gray-600 mt-2 text-center">{product.description || '-'}</p>
                <button onClick={() => handleBuy(product)} className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Payment Modal */}
      <MerchandiseModal isOpen={buyModalOpen} onClose={() => setBuyModalOpen(false)} title="Buy Merchandise">
        {selectedProduct && (
          <MerchandisePaymentForm
            product={selectedProduct}
            onConfirm={data => {
              console.log('Received confirmation in parent:', data);
              setConfirmation(data);
              setBuyModalOpen(false);
            }}
          />
        )}
      </MerchandiseModal>
      {confirmation && (
        (() => { console.log('Rendering confirmation overlay', confirmation); return null; })(),
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg text-center">
            <h2 className="text-2xl font-bold mb-2 text-green-700">Thank you!</h2>
            <p className="text-gray-700 mb-4">
              Your payment has been submitted for <span className="font-semibold">{confirmation.productName}</span>.
            </p>
            <div className="mb-4">
              <div className="font-semibold">Reference ID:</div>
              <div className="text-lg font-bold text-indigo-700 mb-2">{confirmation.referenceId}</div>
              <div className="font-semibold">Order ID:</div>
              <div className="text-lg font-bold text-gray-700 mb-2">{confirmation.orderId}</div>
              <div className="font-semibold">Quantity:</div>
              <div className="text-lg font-bold text-gray-700 mb-2">{confirmation.quantity}</div>
              <div className="font-semibold">Total Paid:</div>
              <div className="text-lg font-bold text-green-700 mb-2">LKR {confirmation.totalAmount}</div>
            </div>
            <button
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
              onClick={() => setConfirmation(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchandiseStore;
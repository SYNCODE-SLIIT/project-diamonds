import React, { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FiUpload } from 'react-icons/fi';

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    invoiceAmount: '',
    invoiceCategory: '',
    userId: '',
    paymentAmount: '',
    paymentMethod: '',
    allocatedBudget: '',
    currentSpend: '',
    transactionDetails: ''
  });
  const [bankSlipFile, setBankSlipFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setBankSlipFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Collect data into FormData (multipart form data)
    const data = new FormData();
    data.append('invoiceNumber', formData.invoiceNumber);
    data.append('invoiceAmount', formData.invoiceAmount);
    data.append('invoiceCategory', formData.invoiceCategory);
    data.append('userId', formData.userId);
    data.append('paymentAmount', formData.paymentAmount);
    data.append('paymentMethod', formData.paymentMethod);
    data.append('allocatedBudget', formData.allocatedBudget);
    data.append('currentSpend', formData.currentSpend);
    data.append('transactionDetails', formData.transactionDetails);
    if (bankSlipFile) {
      data.append('bankSlip', bankSlipFile);
    }

    try {
      const response = await axios.post("http://localhost:4000/api/finance/full-payment", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Payment processed successfully");
      // Clear the form
      setFormData({
        invoiceNumber: '',
        invoiceAmount: '',
        invoiceCategory: '',
        userId: '',
        paymentAmount: '',
        paymentMethod: '',
        allocatedBudget: '',
        currentSpend: '',
        transactionDetails: ''
      });
      setBankSlipFile(null);
      console.log(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Payment processing failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded">
      <Toaster />
      <h2 className="text-2xl font-bold mb-4">Process Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Invoice Number</label>
          <input
            type="text"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Invoice Amount</label>
            <input
              type="number"
              name="invoiceAmount"
              value={formData.invoiceAmount}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Invoice Category</label>
            <input
              type="text"
              name="invoiceCategory"
              value={formData.invoiceCategory}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700">User ID</label>
          <input
            type="text"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Payment Amount</label>
            <input
              type="number"
              name="paymentAmount"
              value={formData.paymentAmount}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Payment Method</label>
            <input
              type="text"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              placeholder="e.g. Bank Transfer, Credit Card"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Allocated Budget</label>
            <input
              type="number"
              name="allocatedBudget"
              value={formData.allocatedBudget}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Current Spend</label>
            <input
              type="number"
              name="currentSpend"
              value={formData.currentSpend}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700">Transaction Details</label>
          <textarea
            name="transactionDetails"
            value={formData.transactionDetails}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            placeholder="Additional information about the transaction"
          />
        </div>
        <div>
          <label className="block text-gray-700">Upload Bank Deposit Slip (PNG or PDF)</label>
          <div className="flex items-center">
            <label className="cursor-pointer flex items-center space-x-2 bg-gray-200 p-2 rounded">
              <FiUpload size={20} />
              <span>Choose File</span>
              <input
                type="file"
                name="bankSlip"
                onChange={handleFileChange}
                accept=".png, .pdf"
                className="hidden"
              />
            </label>
            {bankSlipFile && <span className="ml-2 text-sm">{bankSlipFile.name}</span>}
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
          Process Payment
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;

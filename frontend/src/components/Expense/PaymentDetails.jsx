import React, { useState, useEffect } from 'react';
import { LuArrowLeft, LuRefreshCw } from 'react-icons/lu';
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance';

const PaymentDetails = ({ payment, onBack, onRequestRefund }) => {
  const [merchandise, setMerchandise] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMerchandiseDetails = async () => {
      if (payment?.paymentFor === 'merchandise' && payment?.productId) {
        setLoading(true);
        try {
          const response = await axiosInstance.get(`/api/merchandise/${payment.productId}`);
          setMerchandise(response.data);
        } catch (error) {
          console.error('Error fetching merchandise details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMerchandiseDetails();
  }, [payment]);

  if (!payment) return null;

  return (
    <div className="card w-full">
      <div className="flex items-center justify-between mb-4">
        <button 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          onClick={onBack}
        >
          <LuArrowLeft /> Back to Expenses
        </button>
        <h5 className="text-lg font-medium">Payment Details</h5>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Transaction ID</h6>
            <p className="text-base font-semibold">{payment._id}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Date</h6>
            <p className="text-base font-semibold">
              {moment(payment.date).format("DD MMM YYYY, hh:mm A")}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Amount</h6>
            <p className="text-base font-semibold text-red-500">RS. {payment.amount}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Payment Method</h6>
            <p className="text-base font-semibold">{payment.paymentMethod}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Category</h6>
            <p className="text-base font-semibold">{payment.category}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Status</h6>
            <p className="text-base font-semibold">{payment.status}</p>
          </div>
        </div>

        {/* Show Merchandise Information if payment is for merchandise */}
        {payment.paymentFor === 'merchandise' && (
          <div className="mt-4">
            <h6 className="text-sm font-medium text-gray-500 mb-2">Merchandise Details</h6>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-2 text-center py-4">Loading merchandise details...</div>
              ) : (
                <>
                  {merchandise?.image && (
                    <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                      <h6 className="text-sm font-medium text-gray-500 mb-2">Product Image</h6>
                      <img 
                        src={merchandise.image} 
                        alt={merchandise.name || 'Product'} 
                        className="max-h-48 mx-auto rounded-lg object-contain"
                      />
                    </div>
                  )}
                  
                  {payment.productName && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h6 className="text-sm font-medium text-gray-500">Product Name</h6>
                      <p className="text-base font-semibold">{payment.productName}</p>
                    </div>
                  )}
                  
                  {payment.quantity && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h6 className="text-sm font-medium text-gray-500">Quantity</h6>
                      <p className="text-base font-semibold">{payment.quantity}</p>
                    </div>
                  )}
                  
                  {payment.orderId && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h6 className="text-sm font-medium text-gray-500">Order ID</h6>
                      <p className="text-base font-semibold">{payment.orderId}</p>
                    </div>
                  )}
                  
                  {payment.productId && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h6 className="text-sm font-medium text-gray-500">Product ID</h6>
                      <p className="text-base font-semibold">{payment.productId}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Show Bank Slip Image or File if available */}
        {payment.bankSlipFile && (
          <div className="mt-4">
            <h6 className="text-sm font-medium text-gray-500 mb-2">Bank Slip</h6>
            {payment.bankSlipFile.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={payment.bankSlipFile}
                alt="Bank Slip"
                className="max-w-xs max-h-64 rounded shadow border"
              />
            ) : payment.bankSlipFile.match(/\.pdf$/i) ? (
              <a
                href={payment.bankSlipFile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Bank Slip (PDF)
              </a>
            ) : (
              <a
                href={payment.bankSlipFile}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Download Bank Slip
              </a>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            className="btn-primary flex items-center gap-2"
            onClick={onRequestRefund}
          >
            <LuRefreshCw /> Request Refund
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails; 
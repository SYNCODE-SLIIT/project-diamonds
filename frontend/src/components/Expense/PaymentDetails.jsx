import React from 'react';
import { LuArrowLeft, LuRefreshCw } from 'react-icons/lu';
import moment from 'moment';

const PaymentDetails = ({ payment, onBack, onRequestRefund }) => {
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
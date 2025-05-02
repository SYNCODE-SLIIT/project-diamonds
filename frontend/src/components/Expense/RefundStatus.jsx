import React from 'react';
import { LuCheck, LuX, LuClock } from 'react-icons/lu';
import moment from 'moment';

const RefundStatus = ({ refund }) => {
  if (!refund) return null;

  const getStatusIcon = () => {
    switch (refund.status) {
      case 'approved':
        return <LuCheck className="text-green-500 text-xl" />;
      case 'rejected':
        return <LuX className="text-red-500 text-xl" />;
      case 'pending':
      default:
        return <LuClock className="text-yellow-500 text-xl" />;
    }
  };

  const getStatusColor = () => {
    switch (refund.status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusMessage = () => {
    switch (refund.status) {
      case 'approved':
        return 'Your refund has been approved and will be processed within 5-7 business days.';
      case 'rejected':
        return 'Your refund request has been rejected. Please contact support for more information.';
      case 'pending':
      default:
        return 'Your refund request is being reviewed. We will notify you once a decision has been made.';
    }
  };

  return (
    <div className="card w-full">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-medium">Refund Status</h5>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="text-sm font-medium capitalize">{refund.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Refund ID</h6>
            <p className="text-base font-semibold">{refund._id}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Request Date</h6>
            <p className="text-base font-semibold">
              {moment(refund.processedAt).format("DD MMM YYYY, hh:mm A")}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Refund Amount</h6>
            <p className="text-base font-semibold text-red-500">RS. {refund.refundAmount}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Reason</h6>
            <p className="text-base font-semibold">{refund.reason}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h6 className="text-sm font-medium text-gray-500">Status Message</h6>
          <p className="text-base">{getStatusMessage()}</p>
        </div>

        {refund.receiptFile && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Documentation</h6>
            <a 
              href={refund.receiptFile} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View uploaded document
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefundStatus; 
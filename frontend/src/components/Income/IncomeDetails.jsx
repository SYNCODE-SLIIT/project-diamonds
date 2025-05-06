import React from 'react';
import { LuArrowLeft } from 'react-icons/lu';
import moment from 'moment';

const IncomeDetails = ({ income, onBack }) => {
  if (!income) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          onClick={onBack}
        >
          <LuArrowLeft /> Back to Income
        </button>
        <h5 className="text-lg font-medium">Income Details</h5>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Transaction ID</h6>
            <p className="text-base font-semibold">{income._id}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Date</h6>
            <p className="text-base font-semibold">
              {moment(income.date).format("DD MMM YYYY, hh:mm A")}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Amount</h6>
            <p className="text-base font-semibold text-green-600">RS. {income.amount}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-sm font-medium text-gray-500">Source</h6>
            <p className="text-base font-semibold">{income.source}</p>
          </div>
          {income.icon && (
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <h6 className="text-sm font-medium text-gray-500 mb-2">Icon</h6>
              <img src={income.icon} alt="Income Icon" className="max-w-xs max-h-24 rounded shadow border" />
            </div>
          )}
          {income.description && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="text-sm font-medium text-gray-500">Description</h6>
              <p className="text-base text-gray-700">{income.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomeDetails; 
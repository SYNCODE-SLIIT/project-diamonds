import React from "react";
import {
  LuUtensils,
  LuTrendingUp,
  LuTrendingDown,
  LuTrash2,
  LuEye,
} from "react-icons/lu";

const TransactionInfoCard = ({
  title,
  icon,
  date,
  amount,
  type,
  hideDeleteBtn,
  onDelete,
  onViewDetails,
  id,
}) => {
  return (
    <div className="group relative flex items-center gap-4 w-full max-w-xl px-4 py-2 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow duration-300">
      {/* Icon Container */}
      <div className="w-10 h-10 flex items-center justify-center text-lg text-gray-800 bg-gray-100 rounded-full">
        {icon ? (
          <img src={icon} alt={title} className="w-6 h-6" />
        ) : (
          <LuUtensils />
        )}
      </div>

      {/* Transaction Details */}
      <div className="flex-1 space-y-0.5">
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        <p className="text-xs text-gray-500">{date}</p>
      </div>

      {/* Amount Display with unchanged conditional colors */}
      <div
        className={`flex items-center gap-1 ml-auto font-bold text-xs px-2 py-1 rounded-full ${
          type === "income"
            ? "bg-green-200 text-green-700"
            : "bg-red-300 text-red-500"
        }`}
      >
        <span>
          {type === "income" ? "+" : "-"}RS.{amount}
        </span>
        {type === "income" ? (
          <LuTrendingUp size={14} />
        ) : (
          <LuTrendingDown size={14} />
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute right-2 top-2 flex gap-1">
        {!hideDeleteBtn && (
          <button
            className="p-1 text-gray-400 hover:text-red-600 transition-opacity opacity-0 group-hover:opacity-100"
            onClick={onDelete}
          >
            <LuTrash2 size={18} />
          </button>
        )}
        
        {type === "expense" && onViewDetails && (
          <button
            className="p-1 text-gray-400 hover:text-blue-600 transition-opacity opacity-0 group-hover:opacity-100"
            onClick={() => onViewDetails(id)}
            title="View Details"
          >
            <LuEye size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionInfoCard;

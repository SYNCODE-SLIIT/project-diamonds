import React from "react";
import {
  LuUtensils,
  LuTrendingDown,
  LuTrash2,
  LuTrendingUp,
} from "react-icons/lu";

const TransactionInfoCard = ({
  title,
  icon,
  date,
  amount,
  type,
  hideDeleteBtn,
  onDelete,
}) => {
  return (
    <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60">
      {/* Icon Container */}
      <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
        {icon ? (
          <img src={icon} alt={title} className="w-6 h-6" />
        ) : (
          <LuUtensils />
        )}
      </div>

      {/* Transaction Details */}
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm text-gray-700 font-medium">{title}</span>
        <span className="text-xs text-gray-400 mt-1">{date}</span>
      </div>

      {/* Amount Display */}
      <div
        className={`ml-auto font-bold text-sm px-3 py-1 rounded-full ${
          type === "income"
            ? "bg-green-200 text-green-700"
            : "bg-red-300 text-red-500"
        }`}
      >
        <h6 className="text-xs font-medium">
          {type === "income" ? "+" : "-"}RS.{amount}
        </h6>
        {type === "income" ? <LuTrendingUp /> : <LuTrendingDown />}
      </div>

      {/* Delete Button (if not hidden) */}
      <div className="flex items-center gap-2">
        {!hideDeleteBtn && (
          <button
            className="text-gray-400 absolute right-2 top-2 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={onDelete}
          >
            <LuTrash2 size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 px-1.5 rounded-b-md">
        <h6 className="">{type}</h6>
      </div>
    </div>
  );
};

export default TransactionInfoCard;

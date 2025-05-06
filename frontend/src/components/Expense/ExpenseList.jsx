import React from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

const ExpenseList = ({transactions, onDelete, onDownload, onViewDetails}) => {
  return (
    <div className="card w-full">
        <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-medium">Expense Categories</h5>

            <button className="card-btn" onClick={onDownload}>
                <LuDownload className="text-base" /> Download
            </button>
        </div>

        <div className="max-h-96 overflow-y-auto pr-2">
            {transactions && transactions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {transactions.map((expense) => (
                    <TransactionInfoCard
                        key={expense._id}
                        id={expense.paymentId}
                        title={expense.category}
                        icon={expense.icon}
                        date={moment(expense.date).format("DD MMM YYYY")}
                        amount={expense.amount}
                        type="expense"
                        onDelete={() => onDelete(expense._id)}
                        onViewDetails={onViewDetails}
                    />
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500">
                    No expenses found. Add your first expense!
                </div>
            )}
        </div>
    </div>
  )
}

export default ExpenseList
import React from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

const IncomeList = ({transactions, onDelete, onDownload, onViewDetails}) => {
  return (
    <div className="card w-full">
        <div className="flex items-center justify-between mb-4">
            <h5 className="text-lg font-medium">Income Sources</h5>

            <button className="card-btn" onClick={onDownload}>
                <LuDownload className="text-base" /> Download
            </button>
        </div>

        <div className="max-h-96 overflow-y-auto pr-2">
            {transactions && transactions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {transactions.map((income) => (
                    <TransactionInfoCard
                        key={income._id}
                        id={income._id}
                        title={income.source}
                        icon={income.icon}
                        date={moment(income.date).format("DD MMM YYYY")}
                        amount={income.amount}
                        type="income"
                        onDelete={() => onDelete(income._id)}
                        onViewDetails={onViewDetails ? () => onViewDetails(income._id) : undefined}
                    />
                    ))}
                </div>
            ) : (
                <div className="text-center py-4 text-gray-500">
                    No income sources found. Add your first income source!
                </div>
            )}
        </div>
    </div>
  )
}

export default IncomeList
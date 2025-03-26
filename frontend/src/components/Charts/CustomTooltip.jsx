import React from 'react'

const CustomTooltip = ({active, payload}) => {
    if (active && payload && payload. length) {
        return (
            <div className="bg-white shadow-lg p-2 border border-gray-300">
                <p className="text-xs font-semibold text-purple-800 b-1">{payload[0].name}</p>
                <p className="txt-sm text-gray-600">
                    Amount: <span className="text-sm font-medium text-gray-900">RS.{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
}

export default CustomTooltip
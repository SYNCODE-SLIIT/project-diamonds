import React, { useEffect, useState } from 'react';


const FinancialDashboard = () => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    // Fetch financial report on component mount
    const fetchReport = async () => {
      try {
        const res = await axios.get('http://localhost:4000/frontend/financial/report');
        setReport(res.data);
      } catch (error) {
        console.error('Error fetching report:', error);
      }
    };
    fetchReport();
  }, []);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-4">Financial Dashboard</h1>
      {report ? (
        <div className="bg-white p-4 rounded shadow">
          <p>Total Revenue: ${report.totalRevenue}</p>
          <h2 className="text-xl font-semibold mt-4">Transactions:</h2>
          <ul>
            {report.transactions.map((tx) => (
              <li key={tx._id}>
                {tx.transactionType} - ${tx.totalAmount} on {new Date(tx.date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>Loading report...</p>
      )}
    </div>
  );
};

export default FinancialDashboard;

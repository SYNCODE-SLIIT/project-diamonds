import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import EditModal from './EditModal';
import ViewModal from './ViewModal';
import OverviewTab from './OverviewTab';
import axiosInstance from '../../utils/axiosInstance';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [salaryInputs, setSalaryInputs] = useState({});

  const recordTypeMap = {
    payments: 'payment',
    budgets: 'budget',
    invoices: 'invoice',
    refunds: 'refund',
    transactions: 'transaction'
  };

  const updateRecordMap = {
    payments: 'p',
    budgets: 'b',
    invoices: 'i',
    refunds: 'r',
    transactions: 't'
  };

  const fetchData = async () => {
    try {
      let res;
      if (activeTab === 'overview') {
        res = await axiosInstance.get('/api/finance/dashboard');
        setData(res.data);
      } else if (activeTab === 'salary') {
        res = await axiosInstance.get('/api/finance/salary/members');
        const dataArray = Array.isArray(res.data.data) ? res.data.data : [];
        setData(dataArray);
      } else {
        switch (activeTab) {
          case 'payments':
            res = await axiosInstance.get('/api/finance/getp');
            break;
          case 'budgets':
            res = await axiosInstance.get('/api/finance/getb');
            break;
          case 'invoices':
            res = await axiosInstance.get('/api/finance/geti');
            break;
          case 'refunds':
            res = await axiosInstance.get('/api/finance/getr');
            break;
          case 'transactions':
            res = await axiosInstance.get('/api/finance/gett');
            break;
          default:
            res = { data: [] };
        }
        const dataArray = Array.isArray(res.data.data) ? res.data.data : [];
        setData(dataArray);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error fetching data');
      toast.error('Error fetching data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        const recordType = recordTypeMap[activeTab];
        const deleteUrl = `/api/finance/${recordType}/${item._id}`;
        await axiosInstance.delete(deleteUrl);
        toast.success('Record deleted successfully.');
        fetchData();
      } catch (err) {
        console.error('Error deleting record:', err);
        toast.error('Error deleting record.');
      }
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      const recordType = updateRecordMap[activeTab];
      const updateData = activeTab === 'invoices' ? { paymentStatus: newStatus } : { status: newStatus };
      await axiosInstance.patch(`/api/finance/${recordType}/${item._id}`, updateData);
      toast.success('Status updated successfully.');
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Error updating status.');
    }
  };

  const handleSalaryInputChange = (memberId, value) => {
    setSalaryInputs(prev => ({ ...prev, [memberId]: value }));
  };

  const handlePaySalary = async (memberId) => {
    const salaryAmount = salaryInputs[memberId];
    if (!salaryAmount || isNaN(salaryAmount) || salaryAmount <= 0) {
      toast.error('Please enter a valid salary amount.');
      return;
    }
    try {
      await axiosInstance.post('/api/finance/salary/pay', { memberId, salaryAmount });
      toast.success('Salary paid successfully.');
      setSalaryInputs(prev => ({ ...prev, [memberId]: '' }));
      fetchData();
    } catch (err) {
      console.error('Error paying salary:', err);
      toast.error('Error paying salary.');
    }
  };

  const renderSalaryTable = () => {
    const dataArray = Array.isArray(data) ? data : [];
    if (dataArray.length === 0) return <p className="text-center p-4 text-gray-600">No data found.</p>;
    return (
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">User Email</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">User Full Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Salary Payment</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {dataArray.map((member, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-800">{member.email}</td>
                <td className="p-4 text-gray-800">{member.fullName}</td>
                <td className="p-4">
                  <input
                    type="number"
                    placeholder="Enter salary"
                    value={salaryInputs[member._id] || ''}
                    onChange={(e) => handleSalaryInputChange(member._id, e.target.value)}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full"
                  />
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handlePaySalary(member._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                  >
                    Pay Salary
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDataTable = () => {
    const dataArray = Array.isArray(data) ? data : [];
    if (dataArray.length === 0) return <p className="text-center p-4 text-gray-600">No data found.</p>;
    return (
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">User Email</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">User Full Name</th>
              {activeTab !== 'transactions' && (
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
              )}
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Details</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataArray.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-800">{item.user ? item.user.email : 'N/A'}</td>
                <td className="p-4 text-gray-800">{item.user ? item.user.fullName : 'N/A'}</td>
                {activeTab !== 'transactions' && (
                  <td className="p-4">
                    {(activeTab === 'payments' || activeTab === 'invoices' || activeTab === 'budgets' || activeTab === 'refunds') ? (
                      <select
                        value={activeTab === 'invoices' ? item.paymentStatus : item.status}
                        onChange={(e) => handleStatusChange(item, e.target.value)}
                        className="py-2 px-3 rounded border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
                      >
                        {activeTab === 'invoices' ? (
                          <>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </>
                        ) : (
                          <>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <span className="text-gray-600">N/A</span>
                    )}
                  </td>
                )}
                <td className="p-4">
                  {activeTab === 'payments' && (
                    <div className="space-y-1 text-gray-700">
                      <div>Amount: <span className="font-medium">RS.{item.amount}</span></div>
                      <div>Method: <span className="font-medium">{item.paymentMethod}</span></div>
                      {/* <div className="mt-2">
                        <strong>Bank Slip:</strong>
                        {item.bankSlipFile ? (
                          item.bankSlipFile.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                              src={`http://localhost:4000/uploads/${item.bankSlipFile}`}
                              width="200"
                              height="200"
                              title="Bank Slip PDF"
                              className="mt-2 rounded shadow-md"
                            />
                          ) : (
                            <img
                              src={`http://localhost:4000/uploads/${item.bankSlipFile}`}
                              alt="Bank Slip"
                              width="200"
                              className="mt-2 rounded shadow-md"
                            />
                          )
                        ) : (
                          <span className="text-gray-500">No bank slip uploaded</span>
                        )}
                      </div> */}
                    </div>
                  )}
                  {activeTab === 'budgets' && (
                    <div className="text-gray-700">
                      <div>Allocated: <span className="font-medium">RS.{item.allocatedBudget}</span></div>
                    </div>
                  )}
                  {activeTab === 'invoices' && (
                    <div className="space-y-1 text-gray-700">
                      <div>Invoice #: <span className="font-medium">{item.invoiceNumber}</span></div>
                      <div>Amount: <span className="font-medium">RS.{item.amount}</span></div>
                    </div>
                  )}
                  {activeTab === 'refunds' && (
                    <div className="space-y-1 text-gray-700">
                      <div>Refund Amount: <span className="font-medium">RS.{item.refundAmount}</span></div>
                      <div>Reason: <span className="font-medium">{item.reason}</span></div>
                    </div>
                  )}
                  {activeTab === 'transactions' && (
                    <div className="space-y-1 text-gray-700">
                      <div>Type: <span className="font-medium">{item.transactionType}</span></div>
                      <div>Total: <span className="font-medium">RS.{item.totalAmount}</span></div>
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleView(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Get tab indicator color
  const getTabIndicatorClass = (tab) => {
    if (tab === activeTab) {
      return "border-b-2 border-blue-600";
    }
    return "";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 text-center">Financial Dashboard</h2>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap justify-center border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'payments', label: 'Payments' },
            { id: 'budgets', label: 'Budgets' },
            { id: 'invoices', label: 'Invoices' },
            { id: 'refunds', label: 'Refunds' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'salary', label: 'Salary' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`relative px-6 py-3 font-medium text-gray-700 hover:text-blue-600 transition-colors focus:outline-none ${
                activeTab === tab.id 
                ? "text-blue-600 font-semibold " + getTabIndicatorClass(tab.id)
                : ""
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {error && <p className="text-center text-red-500 mb-4">{error}</p>}
          
          {activeTab === 'overview' ? (
            <div className="bg-white rounded-lg p-4">
              <OverviewTab data={data} />
            </div>
          ) : activeTab === 'salary' ? (
            renderSalaryTable()
          ) : (
            renderDataTable()
          )}
        </div>
      </div>
      
      {isEditModalOpen && 
        <EditModal 
          item={selectedItem} 
          activeTab={activeTab}
          onClose={() => { 
            setIsEditModalOpen(false); 
            setSelectedItem(null); 
            fetchData(); 
          }} 
        />
      }
      {isViewModalOpen && 
        <ViewModal 
          item={selectedItem} 
          activeTab={activeTab}
          onClose={() => { 
            setIsViewModalOpen(false); 
            setSelectedItem(null); 
            fetchData(); 
          }} 
        />
      }
    </div>
  );
};

export default Dashboard;

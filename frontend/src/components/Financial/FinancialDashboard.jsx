import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import EditModal from './EditModal';
import ViewModal from './ViewModal';
import OverviewTab from './OverviewTab';
import axiosInstance from '../../utils/axiosInstance';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [salaryInputs, setSalaryInputs] = useState({});
  const [incomeTypeInputs, setIncomeTypeInputs] = useState({});
  const [noteInputs, setNoteInputs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payingMemberId, setPayingMemberId] = useState(null);

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

  // Reset search field when tab changes
  useEffect(() => {
    setSearchTerm('');
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
      let updateData;
      if (activeTab === 'budgets') {
        // Check if any required field is missing
        let fullBudget = item;
        if (
          item.allocatedBudget === undefined ||
          item.currentSpend === undefined ||
          item.reason === undefined ||
          item.remainingBudget === undefined
        ) {
          // Fetch full budget object
          const res = await axiosInstance.get(`/api/finance/getb/${item._id}`);
          fullBudget = res.data;
        }
        updateData = {
          allocatedBudget: fullBudget.allocatedBudget ?? 0,
          currentSpend: fullBudget.currentSpend ?? 0,
          status: newStatus,
          reason: fullBudget.reason ?? '',
          remainingBudget: fullBudget.remainingBudget ?? 0,
        };
        console.log('PATCH budget updateData:', updateData);
      } else if (activeTab === 'invoices') {
        updateData = { paymentStatus: newStatus };
      } else {
        updateData = { status: newStatus };
      }
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

  const handleIncomeTypeChange = (memberId, value) => {
    setIncomeTypeInputs(prev => ({ ...prev, [memberId]: value }));
  };

  const handleNoteInputChange = (memberId, value) => {
    setNoteInputs(prev => ({ ...prev, [memberId]: value }));
  };

  const handlePaySalary = async (memberId) => {
    const salaryAmount = salaryInputs[memberId];
    const incomeType = incomeTypeInputs[memberId] || 'Salary';
    const note = noteInputs[memberId] || '';
    if (!salaryAmount || isNaN(salaryAmount) || salaryAmount <= 0) {
      toast.error('Please enter a valid salary amount.');
      return;
    }
    try {
      await axiosInstance.post('/api/finance/salary/pay', { memberId, salaryAmount, incomeType, note });
      toast.success('Salary paid successfully.');
      setSalaryInputs(prev => ({ ...prev, [memberId]: '' }));
      setIncomeTypeInputs(prev => ({ ...prev, [memberId]: 'Salary' }));
      setNoteInputs(prev => ({ ...prev, [memberId]: '' }));
      fetchData();
    } catch (err) {
      console.error('Error paying salary:', err);
      toast.error('Error paying salary.');
    }
  };

  // Filtered data for tables
  let filteredData = Array.isArray(data)
    ? data.filter(item => {
        let matchesSearch = true;
        const term = searchTerm.trim().toLowerCase();
        if (!term) matchesSearch = true;
        else if (activeTab === 'salary') {
          matchesSearch =
            (item.email?.toLowerCase().includes(term) ||
             item.fullName?.toLowerCase().includes(term));
        } else if (activeTab === 'payments') {
          matchesSearch =
            (item.user?.email?.toLowerCase().includes(term) ||
             item.user?.fullName?.toLowerCase().includes(term) ||
             String(item.amount || '').toLowerCase().includes(term) ||
             (item.paymentMethod || '').toLowerCase().includes(term) ||
             (item.status || '').toLowerCase().includes(term));
        } else if (activeTab === 'budgets') {
          matchesSearch =
            (item.user?.email?.toLowerCase().includes(term) ||
             item.user?.fullName?.toLowerCase().includes(term) ||
             String(item.allocatedBudget || '').toLowerCase().includes(term) ||
             String(item.remainingBudget || '').toLowerCase().includes(term) ||
             (item.reason || '').toLowerCase().includes(term) ||
             (item.status || '').toLowerCase().includes(term));
        } else if (activeTab === 'invoices') {
          matchesSearch =
            (item.user?.email?.toLowerCase().includes(term) ||
             item.user?.fullName?.toLowerCase().includes(term) ||
             (item.invoiceNumber || '').toLowerCase().includes(term) ||
             String(item.amount || '').toLowerCase().includes(term) ||
             (item.paymentStatus || '').toLowerCase().includes(term));
        } else if (activeTab === 'refunds') {
          matchesSearch =
            (item.user?.email?.toLowerCase().includes(term) ||
             item.user?.fullName?.toLowerCase().includes(term) ||
             String(item.refundAmount || '').toLowerCase().includes(term) ||
             (item.reason || '').toLowerCase().includes(term) ||
             (item.status || '').toLowerCase().includes(term));
        } else if (activeTab === 'transactions') {
          matchesSearch =
            (item.user?.email?.toLowerCase().includes(term) ||
             item.user?.fullName?.toLowerCase().includes(term) ||
             (item.transactionType || '').toLowerCase().includes(term) ||
             String(item.totalAmount || '').toLowerCase().includes(term) ||
             (item.date ? new Date(item.date).toLocaleString().toLowerCase().includes(term) : false));
        }
        const matchesStatus =
          !statusFilter ||
          (item.status === statusFilter || item.paymentStatus === statusFilter);
        return matchesSearch && matchesStatus;
      })
    : [];

  // Sort by date/createdAt/updatedAt descending (most recent first)
  filteredData = filteredData.slice().sort((a, b) => {
    const getDate = (obj) =>
      new Date(obj.date || obj.createdAt || obj.updatedAt || 0).getTime();
    return getDate(b) - getDate(a);
  });

  const renderStatusBadge = (status) => {
    if (!status) return null;
    let color = 'bg-gray-300 text-gray-800';
    if (status === 'approved' || status === 'paid') color = 'bg-green-200 text-green-800';
    else if (status === 'pending') color = 'bg-yellow-200 text-yellow-800';
    else if (status === 'rejected' || status === 'failed') color = 'bg-red-200 text-red-800';
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const renderTableHeader = (headers) => (
    <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
      <tr>
        {headers.map((header, idx) => (
          <th key={idx} className="p-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{header}</th>
        ))}
      </tr>
    </thead>
  );

  const renderTableRow = (row, cells) => (
    <tr key={row._id || row.email} className="border-b border-gray-100 hover:bg-gray-50 transition-colors even:bg-gray-50">
      {cells.map((cell, idx) => (
        <td key={idx} className="p-4 text-gray-800 max-w-xs truncate" title={row[cell] || ''}>{row[cell]}</td>
      ))}
    </tr>
  );

  const renderSalaryTable = () => {
    const dataArray = Array.isArray(filteredData) ? filteredData : [];
    if (!dataArray || dataArray.length === 0) return <p className="text-center p-4 text-gray-600">No data found.</p>;
    return (
      <div className="mt-6">
        <div className="sticky top-0 z-20 bg-gray-50 p-4 flex flex-wrap gap-2 items-center rounded-t-xl shadow-sm">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full md:w-80"
            aria-label="Search by name or email"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-gray-50">
            {dataArray.map((member, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 hover:shadow-lg transition group focus-within:ring-2 focus-within:ring-blue-400"
              tabIndex={0}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">
                  {(member?.fullName ? member.fullName.split(' ').map(n => n[0]).join('') : (member?.email ? member.email[0].toUpperCase() : '?'))}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-800 truncate" title={member?.fullName || ''}>{member?.fullName || ''}</span>
                  <span className="text-gray-500 text-sm truncate" title={member?.email || ''}>{member?.email || ''}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs text-gray-500 font-medium" htmlFor={`salary-${member?._id}`}>Salary Payment</label>
                  <input
                  id={`salary-${member?._id}`}
                    type="number"
                  placeholder="Enter amount"
                  value={salaryInputs[member?._id] || ''}
                  onChange={(e) => handleSalaryInputChange(member?._id, e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                  aria-label={`Enter salary for ${member?.fullName || ''}`}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs text-gray-500 font-medium" htmlFor={`incomeType-${member?._id}`}>Income Type</label>
                <select
                  id={`incomeType-${member?._id}`}
                  value={incomeTypeInputs[member?._id] || 'Salary'}
                  onChange={(e) => handleIncomeTypeChange(member?._id, e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                  aria-label={`Select income type for ${member?.fullName || ''}`}
                >
                  <option value="Salary">Salary</option>
                  <option value="Bonus">Bonus</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Event Payment">Event Payment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs text-gray-500 font-medium" htmlFor={`note-${member?._id}`}>Note</label>
                <input
                  id={`note-${member?._id}`}
                  type="text"
                  placeholder="Optional note"
                  value={noteInputs[member?._id] || ''}
                  onChange={(e) => handleNoteInputChange(member?._id, e.target.value)}
                  className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                  aria-label={`Add note for ${member?.fullName || ''}`}
                />
              </div>
              <div className="flex justify-end mt-2">
                  <button
                  onClick={async () => {
                    setPayingMemberId(member?._id);
                    await handlePaySalary(member?._id);
                    setPayingMemberId(null);
                  }}
                  className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-5 rounded shadow transition-all text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center ${payingMemberId === member?._id ? 'opacity-60 cursor-wait' : ''}`}
                  aria-label={`Pay salary to ${member?.fullName || ''}`}
                  disabled={payingMemberId === member?._id}
                >
                  {payingMemberId === member?._id ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  ) : null}
                  Pay
                  </button>
              </div>
            </div>
            ))}
        </div>
      </div>
    );
  };

  const renderDataCards = () => {
    const dataArray = Array.isArray(filteredData) ? filteredData : [];
    if (!dataArray || dataArray.length === 0) return <p className="text-center p-4 text-gray-600">No data found.</p>;
    return (
      <div className="mt-6">
        <div className="sticky top-0 z-20 bg-gray-50 p-4 flex flex-wrap gap-2 items-center rounded-t-xl shadow-sm">
          <input
            type="text"
            placeholder="Search by name, email, or details"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full md:w-80"
            aria-label="Search by name, email, or details"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-gray-50">
          {dataArray.map((item, idx) => (
            <div
              key={item._id || idx}
              className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4 hover:shadow-lg transition group focus-within:ring-2 focus-within:ring-blue-400"
              tabIndex={0}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">
                  {item.user && item.user.fullName ? item.user.fullName.split(' ').map(n => n[0]).join('') : (item.user && item.user.email ? item.user.email[0].toUpperCase() : '?')}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-800 truncate" title={item.user?.fullName || ''}>{item.user?.fullName || ''}</span>
                  <span className="text-gray-500 text-sm truncate" title={item.user?.email || ''}>{item.user?.email || ''}</span>
                </div>
              </div>
              {/* Main details for each tab */}
              {activeTab === 'payments' && (
                <div className="flex flex-col gap-2 text-gray-700 text-sm">
                  <div><span className="font-medium">Amount:</span> RS.{item.amount}</div>
                  <div><span className="font-medium">Method:</span> {item.paymentMethod}</div>
                  <div><span className="font-medium">Status:</span> {renderStatusBadge(item.status)}</div>
                </div>
              )}
              {activeTab === 'budgets' && (
                <div className="flex flex-col gap-2 text-gray-700 text-sm">
                  <div><span className="font-medium">Allocated:</span> RS.{item.allocatedBudget}</div>
                  <div><span className="font-medium">Remaining:</span> RS.{item.remainingBudget}</div>
                  <div><span className="font-medium">Status:</span> {renderStatusBadge(item.status)}</div>
                  <div><span className="font-medium">Reason:</span> {item.reason}</div>
                </div>
              )}
              {activeTab === 'invoices' && (
                <div className="flex flex-col gap-2 text-gray-700 text-sm">
                  <div><span className="font-medium">Invoice #:</span> {item.invoiceNumber}</div>
                  <div><span className="font-medium">Amount:</span> RS.{item.amount}</div>
                  <div><span className="font-medium">Status:</span> {renderStatusBadge(item.paymentStatus)}</div>
                </div>
              )}
              {activeTab === 'refunds' && (
                <div className="flex flex-col gap-2 text-gray-700 text-sm">
                  <div><span className="font-medium">Refund Amount:</span> RS.{item.refundAmount}</div>
                  <div><span className="font-medium">Reason:</span> {item.reason}</div>
                  <div><span className="font-medium">Status:</span> {renderStatusBadge(item.status)}</div>
                </div>
              )}
              {activeTab === 'transactions' && (
                <div className="flex flex-col gap-2 text-gray-700 text-sm">
                  <div><span className="font-medium">Type:</span> {item.transactionType}</div>
                  <div><span className="font-medium">Total:</span> RS.{item.totalAmount}</div>
                  <div><span className="font-medium">Date:</span> {item.date ? new Date(item.date).toLocaleString() : '-'}</div>
                </div>
              )}
              {/* Status dropdown for applicable tabs */}
              {(activeTab === 'payments' || activeTab === 'invoices' || activeTab === 'budgets' || activeTab === 'refunds') && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-500 font-medium">Change Status</label>
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
                    </div>
                  )}
              {/* Action buttons */}
              <div className="flex gap-2 mt-2 flex-wrap">
                    {activeTab === 'budgets' && (
                      <button
                        onClick={() => handleEdit(item)}
                    className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded shadow-md hover:shadow-lg transition-all text-sm font-semibold"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item)}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded shadow-md hover:shadow-lg transition-all text-sm font-semibold"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleView(item)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded shadow-md hover:shadow-lg transition-all text-sm font-semibold"
                    >
                      View
                    </button>
                  </div>
            </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center flex-1">Financial Dashboard</h2>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap justify-center border-b border-gray-200 mb-4">
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
              className={`relative px-3 py-1.5 text-xs md:px-4 md:py-2 md:text-sm font-medium text-gray-700 rounded-full mx-1 my-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:z-10
                ${activeTab === tab.id ? 'bg-blue-100 text-blue-700 shadow font-semibold' : 'hover:bg-gray-100'}`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              style={{ minWidth: 70 }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {error && <p className="text-center text-red-500 mb-4">{error}</p>}
          
          {loading ? (
            <Skeleton count={8} height={40} className="mb-2" />
          ) : activeTab === 'overview' ? (
            <div className="bg-white rounded-lg p-4">
              <OverviewTab data={data} />
            </div>
          ) : activeTab === 'salary' ? (
            renderSalaryTable()
          ) : (
            renderDataCards()
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

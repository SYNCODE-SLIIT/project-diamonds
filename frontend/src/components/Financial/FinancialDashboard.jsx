import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import EditModal from './EditModal';
import ViewModal from './ViewModal';
import OverviewTab from './OverviewTab';
import axiosInstance from '../../utils/axiosInstance';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { debounce } from 'lodash';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { ErrorBoundary } from 'react-error-boundary';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ITEMS_PER_PAGE = 10;

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
    <h3 className="font-bold">Something went wrong:</h3>
    <pre className="mt-2">{error.message}</pre>
    <button
      onClick={resetErrorBoundary}
      className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Try again
    </button>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton height={40} count={3} />
    <Skeleton height={200} />
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [salaryInputs, setSalaryInputs] = useState({});
  const [incomeTypeInputs, setIncomeTypeInputs] = useState({});
  const [noteInputs, setNoteInputs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payingMemberId, setPayingMemberId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState([]);

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

  const debouncedFetchData = useCallback(
    debounce(async (searchTerm, statusFilter) => {
    try {
        setLoading(true);
      let res;
      if (activeTab === 'overview') {
        res = await axiosInstance.get('/api/finance/dashboard');
        setData(res.data);
      } else if (activeTab === 'salary') {
          res = await axiosInstance.get('/api/finance/salary/members', {
            params: { page: currentPage, limit: ITEMS_PER_PAGE, search: searchTerm }
          });
        const dataArray = Array.isArray(res.data.data) ? res.data.data : [];
        setData(dataArray);
          setTotalPages(Math.ceil(res.data.total / ITEMS_PER_PAGE));
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
          setTotalPages(Math.ceil(res.data.total / ITEMS_PER_PAGE));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error fetching data');
      toast.error('Error fetching data');
      } finally {
        setLoading(false);
    }
    }, 500),
    [activeTab, currentPage]
  );

  const fetchData = () => {
    debouncedFetchData(searchTerm, statusFilter);
  };

  useEffect(() => {
    debouncedFetchData(searchTerm, statusFilter);
    return () => debouncedFetchData.cancel();
  }, [debouncedFetchData, searchTerm, statusFilter]);

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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    
    return data
      .filter(item => {
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
      .sort((a, b) => {
    const getDate = (obj) =>
      new Date(obj.date || obj.createdAt || obj.updatedAt || 0).getTime();
    return getDate(b) - getDate(a);
  });
  }, [data, searchTerm, statusFilter, activeTab]);

  // Sorting logic
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Sort data before pagination
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

  const renderStatusBadge = (status) => {
    if (!status) return null;
    let color = 'bg-gray-300 text-gray-800';
    if (status === 'approved' || status === 'paid') color = 'bg-green-200 text-green-800';
    else if (status === 'pending') color = 'bg-yellow-200 text-yellow-800';
    else if (status === 'rejected' || status === 'failed') color = 'bg-red-200 text-red-800';
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  // Helper: get unique row id
  const getRowId = (row) => row._id || row.email;

  // Only enable bulk actions for these tabs
  const bulkTabs = ['payments', 'budgets', 'invoices', 'refunds', 'transactions'];
  const isBulkTab = bulkTabs.includes(activeTab);

  // Handle row selection
  const handleSelectRow = (row) => {
    const id = getRowId(row);
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (paginatedData.every((row) => selectedRows.includes(getRowId(row)))) {
      setSelectedRows((prev) => prev.filter((id) => !paginatedData.some((row) => getRowId(row) === id)));
    } else {
      setSelectedRows((prev) => [
        ...prev,
        ...paginatedData
          .map(getRowId)
          .filter((id) => !prev.includes(id)),
      ]);
    }
  };
  const isAllSelected = paginatedData.length > 0 && paginatedData.every((row) => selectedRows.includes(getRowId(row)));

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the selected records?')) return;
    for (const row of paginatedData.filter((row) => selectedRows.includes(getRowId(row)))) {
      await handleDelete(row);
    }
    setSelectedRows([]);
  };

  // Bulk export to Excel
  const handleBulkExportExcel = () => {
    const exportRows = paginatedData.filter((row) => selectedRows.includes(getRowId(row)));
    if (!exportRows.length) return;
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`);
    XLSX.writeFile(workbook, `${activeTab}_selected_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Bulk export to PDF
  const handleBulkExportPDF = () => {
    const exportRows = paginatedData.filter((row) => selectedRows.includes(getRowId(row)));
    if (!exportRows.length) return;
    const doc = new jsPDF();
    const columns = Object.keys(exportRows[0] || {}).map((key) => ({ header: key, dataKey: key }));
    doc.text(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Selected Report`, 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [columns.map((col) => col.header)],
      body: exportRows.map((row) => columns.map((col) => row[col.dataKey])),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 },
    });
    doc.save(`${activeTab}_selected_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Update renderTableHeader to include select-all checkbox
  const renderTableHeader = (headers) => (
    <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
      <tr>
        {isBulkTab && (
          <th className="p-4">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              aria-label="Select all rows"
            />
          </th>
        )}
        {headers.map((header, idx) => (
          <th
            key={idx}
            className="p-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap cursor-pointer select-none"
            onClick={() => handleSort(header.key)}
          >
            {header.label}
            {sortColumn === header.key && (
              <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
            )}
          </th>
        ))}
      </tr>
    </thead>
  );

  // Update renderTableRow to include row checkbox
  const renderTableRow = (row, cells) => (
    <tr key={getRowId(row)} className="border-b border-gray-100 hover:bg-gray-50 transition-colors even:bg-gray-50">
      {isBulkTab && (
        <td className="p-4">
          <input
            type="checkbox"
            checked={selectedRows.includes(getRowId(row))}
            onChange={() => handleSelectRow(row)}
            aria-label="Select row"
          />
        </td>
      )}
      {cells.map((cell, idx) => (
        <td key={idx} className="p-4 text-gray-800 max-w-xs truncate" title={row[cell.key] || ''}>{row[cell.key]}</td>
      ))}
    </tr>
  );

  // Bulk action bar
  const renderBulkActionBar = () => (
    <div className="flex gap-4 items-center bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4">
      <span className="font-semibold text-blue-700">{selectedRows.length} selected</span>
      <button
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        onClick={handleBulkDelete}
      >
        Delete Selected
      </button>
      <button
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
        onClick={handleBulkExportExcel}
      >
        Export Selected to Excel
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
        onClick={handleBulkExportPDF}
      >
        Export Selected to PDF
      </button>
      <button
        className="ml-auto text-blue-700 hover:text-blue-900 underline"
        onClick={() => setSelectedRows([])}
      >
        Clear Selection
      </button>
    </div>
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
                  <div><span className="font-medium">Date:</span> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</div>
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

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Financial Data');
      XLSX.writeFile(workbook, `financial_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Data exported successfully');
    } catch (err) {
      console.error('Error exporting data:', err);
      toast.error('Error exporting data');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      let columns = [];
      let rows = [];
      let title = '';
      // Determine columns and rows based on activeTab
      switch (activeTab) {
        case 'payments':
          title = 'Payments';
          columns = [
            { header: 'User', dataKey: 'user' },
            { header: 'Amount', dataKey: 'amount' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Payment Method', dataKey: 'paymentMethod' },
            { header: 'Date', dataKey: 'date' },
          ];
          rows = filteredData.map(item => ({
            user: item.user?.fullName || item.user?.email || 'Unknown',
            amount: item.amount,
            status: item.status,
            paymentMethod: item.paymentMethod,
            date: item.date ? new Date(item.date).toLocaleDateString() : '',
          }));
          break;
        case 'budgets':
          title = 'Budgets';
          columns = [
            { header: 'User', dataKey: 'user' },
            { header: 'Allocated', dataKey: 'allocatedBudget' },
            { header: 'Remaining', dataKey: 'remainingBudget' },
            { header: 'Status', dataKey: 'status' },
            { header: 'Reason', dataKey: 'reason' },
          ];
          rows = filteredData.map(item => ({
            user: item.user?.fullName || item.user?.email || 'Unknown',
            allocatedBudget: item.allocatedBudget,
            remainingBudget: item.remainingBudget,
            status: item.status,
            reason: item.reason,
          }));
          break;
        case 'invoices':
          title = 'Invoices';
          columns = [
            { header: 'User', dataKey: 'user' },
            { header: 'Invoice #', dataKey: 'invoiceNumber' },
            { header: 'Amount', dataKey: 'amount' },
            { header: 'Status', dataKey: 'paymentStatus' },
          ];
          rows = filteredData.map(item => ({
            user: item.user?.fullName || item.user?.email || 'Unknown',
            invoiceNumber: item.invoiceNumber,
            amount: item.amount,
            paymentStatus: item.paymentStatus,
          }));
          break;
        case 'refunds':
          title = 'Refunds';
          columns = [
            { header: 'User', dataKey: 'user' },
            { header: 'Refund Amount', dataKey: 'refundAmount' },
            { header: 'Reason', dataKey: 'reason' },
            { header: 'Status', dataKey: 'status' },
          ];
          rows = filteredData.map(item => ({
            user: item.user?.fullName || item.user?.email || 'Unknown',
            refundAmount: item.refundAmount,
            reason: item.reason,
            status: item.status,
          }));
          break;
        case 'transactions':
          title = 'Transactions';
          columns = [
            { header: 'User', dataKey: 'user' },
            { header: 'Type', dataKey: 'transactionType' },
            { header: 'Total', dataKey: 'totalAmount' },
            { header: 'Date', dataKey: 'date' },
          ];
          rows = filteredData.map(item => ({
            user: item.user?.fullName || item.user?.email || 'Unknown',
            transactionType: item.transactionType,
            totalAmount: item.totalAmount,
            date: item.date ? new Date(item.date).toLocaleDateString() : '',
          }));
          break;
        case 'salary':
          title = 'Salary';
          columns = [
            { header: 'Name', dataKey: 'fullName' },
            { header: 'Email', dataKey: 'email' },
          ];
          rows = filteredData.map(item => ({
            fullName: item.fullName,
            email: item.email,
          }));
          break;
        default:
          toast.error('No data to export');
          setIsExporting(false);
          return;
      }
      doc.text(`${title} Report`, 14, 16);
      autoTable(doc, {
        startY: 22,
        head: [columns.map(col => col.header)],
        body: rows.map(row => columns.map(col => row[col.dataKey])),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
      });
      doc.save(`${title}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const chartData = useMemo(() => {
    if (activeTab === 'overview') {
      return {
        labels: ['Payments', 'Budgets', 'Invoices', 'Refunds', 'Transactions'],
        datasets: [
          {
            label: 'Total Amount',
            data: [
              data.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
              data.budgets?.reduce((sum, b) => sum + (b.allocatedBudget || 0), 0) || 0,
              data.invoices?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0,
              data.refunds?.reduce((sum, r) => sum + (r.refundAmount || 0), 0) || 0,
              data.transactions?.reduce((sum, t) => sum + (t.totalAmount || 0), 0) || 0,
            ],
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      };
    }
    return null;
  }, [data, activeTab]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          {/* Show export buttons for all tabs except Overview */}
          {activeTab !== 'overview' && (
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                disabled={isExporting || loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export to Excel'}
              </button>
              <button
                onClick={exportToPDF}
                disabled={isExporting || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export to PDF'}
              </button>
            </div>
          )}
      </div>
      
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex flex-wrap justify-center border-b border-gray-200 mb-4 sticky top-0 z-30 bg-white" style={{paddingTop: 8, paddingBottom: 8}}>
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
                {activeTab === 'overview' ? (
            <div className="bg-white rounded-lg p-4">
              <OverviewTab data={data} />
                    {chartData && (
                      <div className="mb-8 p-4 bg-white rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
                        <div className="h-64">
                          <Bar
                            data={chartData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'top',
                                },
                                title: {
                                  display: true,
                                  text: 'Financial Summary',
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    )}
            </div>
          ) : activeTab === 'salary' ? (
            renderSalaryTable()
          ) : (
                  <>
                    {isBulkTab && selectedRows.length > 0 && renderBulkActionBar()}
                    {renderDataCards()}
                  </>
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
            
            {/* Add pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 mx-2 rounded bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 mx-2 rounded bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
    </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
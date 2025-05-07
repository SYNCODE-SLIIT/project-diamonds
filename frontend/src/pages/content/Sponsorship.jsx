import React, { useEffect, useState } from 'react';
import axios from 'axios';
import axiosInstance from '../../utils/axiosInstance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const Sponsorship = () => {
  const [sponsorships, setSponsorships] = useState([]);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    sponsorName: '',
    sponsorType: 'Financial',
    contributionDetails: '',
    category: 'Gold',
    duration: '',
    contactPerson: '',
    contactInfo: '',
    status: 'Pending'
  });
  const [lineData, setLineData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Function to download the sponsorship report
  const downloadSponsorshipReport = async () => {
    try {
      const res = await axiosInstance.get('/api/sponsorships/report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Sponsorships_Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading sponsorship report:', err);
    }
  };

  const fetchSponsorships = async () => {
    const res = await axios.get('/api/sponsorships');
    setSponsorships(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`/api/sponsorships/${editId}`, form);
    } else {
      await axios.post('/api/sponsorships', form);
    }
    setForm({ sponsorName: '', sponsorType: 'Financial', contributionDetails: '', category: 'Gold', duration: '', contactPerson: '', contactInfo: '', status: 'Pending' });
    setEditId(null);
    fetchSponsorships();
  };

  useEffect(() => {
    fetchSponsorships();
  }, []);

  useEffect(() => {
    const counts = {};
    sponsorships.forEach((s) => {
      const d = new Date(s.createdAt);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!counts[key]) counts[key] = { month: label, Gold: 0, Silver: 0, Bronze: 0, Supporter: 0 };
      counts[key][s.category] = (counts[key][s.category] || 0) + 1;
    });
    const dataArr = Object.keys(counts).sort().map((key) => counts[key]);
    setLineData(dataArr);
  }, [sponsorships]);

  useEffect(() => {
    const counts = {};
    sponsorships.forEach((s) => {
      counts[s.sponsorType] = (counts[s.sponsorType] || 0) + 1;
    });
    const dataArr = Object.keys(counts).map((type) => ({ type, count: counts[type] }));
    setTypeData(dataArr);
  }, [sponsorships]);

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Gold':
        return 'border-yellow-400 bg-yellow-50';
      case 'Silver':
        return 'border-gray-400 bg-gray-50';
      case 'Bronze':
        return 'border-orange-400 bg-orange-50';
      case 'Supporter':
        return 'border-green-400 bg-green-50';
      default:
        return '';
    }
  };

  const prevSponsor = () => setCurrentIndex(idx => sponsorships.length ? (idx === 0 ? sponsorships.length - 1 : idx - 1) : 0);
  const nextSponsor = () => setCurrentIndex(idx => sponsorships.length ? (idx === sponsorships.length - 1 ? 0 : idx + 1) : 0);

  const getTypeColor = (type) => {
    switch (type) {
      case 'Financial': return '#4CAF50';
      case 'Product-based': return '#2196F3';
      case 'Venue': return '#FF9800';
      case 'Media/PR': return '#9C27B0';
      case 'Food & Beverages': return '#FF5722';
      case 'Technical/Equipment': return '#795548';
      default: return '#8884d8';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Form Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-extrabold text-indigo-600 mb-6 text-center">Sponsorship Tracker</h2>
        <button onClick={downloadSponsorshipReport} className="mb-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition">Download Sponsorship Report</button>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Sponsor Name" value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} className="border p-2 w-full" required />
            <select value={form.sponsorType} onChange={(e) => setForm({ ...form, sponsorType: e.target.value })} className="border p-2 w-full">
              <option>Financial</option>
              <option>Product-based</option>
              <option>Venue</option>
              <option>Media/PR</option>
              <option>Food & Beverages</option>
              <option>Technical/Equipment</option>
            </select>
            <textarea placeholder="Contribution Details" value={form.contributionDetails} onChange={(e) => setForm({ ...form, contributionDetails: e.target.value })} className="border p-2 w-full" rows={2} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border p-2 w-full">
              <option>Gold</option>
              <option>Silver</option>
              <option>Bronze</option>
              <option>Supporter</option>
            </select>
            <input type="text" placeholder="Sponsorship Duration (e.g., 6 months)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="border p-2 w-full" />
            <input type="text" placeholder="Contact Person" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="border p-2 w-full" />
            <input type="text" placeholder="Contact Email or Phone" value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} className="border p-2 w-full" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border p-2 w-full">
              <option>Pending</option>
              <option>Active</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition">
              {editId ? 'Update Sponsorship' : 'Add Sponsorship'}
            </button>
          </div>
        </form>
      </div>
      {/* Charts Section */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Month-wise Sponsorships by Category</h3>
          <div className="bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="#e0e0e0" strokeDasharray="5 5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#555" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#555" }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
                <Line
                  type="monotone"
                  dataKey="Gold"
                  stroke="#FFD700"
                  strokeWidth={2}
                  dot={{ r: 4, stroke: '#FFD700', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#FFD700' }}
                />
                <Line
                  type="monotone"
                  dataKey="Silver"
                  stroke="#C0C0C0"
                  strokeWidth={2}
                  dot={{ r: 4, stroke: '#C0C0C0', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#C0C0C0' }}
                />
                <Line
                  type="monotone"
                  dataKey="Bronze"
                  stroke="#CD7F32"
                  strokeWidth={2}
                  dot={{ r: 4, stroke: '#CD7F32', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#CD7F32' }}
                />
                <Line
                  type="monotone"
                  dataKey="Supporter"
                  stroke="#32CD32"
                  strokeWidth={2}
                  dot={{ r: 4, stroke: '#32CD32', strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#32CD32' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Sponsor Count by Type</h3>
          <div className="bg-white p-4 rounded shadow">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#555" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#555" }} />
                <Tooltip />
                <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell key={index} fill={getTypeColor(entry.type)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Slider Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 flex items-center justify-center mb-8">
        <button onClick={prevSponsor} className="text-3xl text-indigo-600 hover:text-indigo-800 transition px-4">⟨</button>
        <div className="mx-4 flex-shrink-0 bg-gray-100 rounded-lg p-4 shadow-inner w-full max-w-md text-center">
          {sponsorships.length > 0 ? (
            (() => {
              const s = sponsorships[currentIndex];
              return (
                <>
                  <p><strong>Name:</strong> {s.sponsorName}</p>
                  <p><strong>Type:</strong> {s.sponsorType}</p>
                  <p><strong>Contribution:</strong> {s.contributionDetails}</p>
                  <p><strong>Category:</strong> {s.category}</p>
                  <p><strong>Duration:</strong> {s.duration}</p>
                  <p><strong>Contact Person:</strong> {s.contactPerson}</p>
                  <p><strong>Contact:</strong> {s.contactInfo}</p>
                  <p><strong>Status:</strong> {s.status}</p>
                </>
              );
            })()
          ) : (
            <p className="text-gray-500">No sponsors available</p>
          )}
        </div>
        <button onClick={nextSponsor} className="text-3xl text-indigo-600 hover:text-indigo-800 transition px-4">⟩</button>
      </div>
      {/* Manage Sponsors Table Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Manage Sponsors</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-indigo-100">
              <tr>
                <th className="py-2 px-4 border">Name</th>
                <th className="py-2 px-4 border">Type</th>
                <th className="py-2 px-4 border">Category</th>
                <th className="py-2 px-4 border">Duration</th>
                <th className="py-2 px-4 border">Contact</th>
                <th className="py-2 px-4 border">Status</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{s.sponsorName}</td>
                  <td className="py-2 px-4 border">{s.sponsorType}</td>
                  <td className="py-2 px-4 border">{s.category}</td>
                  <td className="py-2 px-4 border">{s.duration}</td>
                  <td className="py-2 px-4 border">{s.contactInfo}</td>
                  <td className="py-2 px-4 border">{s.status}</td>
                  <td className="py-2 px-4 border space-x-2">
                    <button onClick={() => {
                      setForm({
                        sponsorName: s.sponsorName,
                        sponsorType: s.sponsorType,
                        contributionDetails: s.contributionDetails,
                        category: s.category,
                        duration: s.duration,
                        contactPerson: s.contactPerson,
                        contactInfo: s.contactInfo,
                        status: s.status
                      });
                      setEditId(s._id);
                    }} className="text-blue-600">Edit</button>
                    <button onClick={async () => {
                      if (window.confirm('Delete this sponsorship?')) {
                        await axios.delete(`/api/sponsorships/${s._id}`);
                        fetchSponsorships();
                        setCurrentIndex(0);
                      }
                    }} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sponsorship;

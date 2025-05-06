import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Sponsorship = () => {
  const [sponsorships, setSponsorships] = useState([]);
  const [form, setForm] = useState({
    sponsorName: '', sponsorType: 'Monetary', amount: '', duration: '', contactEmail: '', status: 'Pending'
  });

  const fetchSponsorships = async () => {
    const res = await axios.get('/api/sponsorships');
    setSponsorships(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('/api/sponsorships', form);
    setForm({ sponsorName: '', sponsorType: 'Monetary', amount: '', duration: '', contactEmail: '', status: 'Pending' });
    fetchSponsorships();
  };

  useEffect(() => {
    fetchSponsorships();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sponsorship Tracker</h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="text" placeholder="Sponsor Name" value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })} className="border p-2 w-full" required />
        <select value={form.sponsorType} onChange={(e) => setForm({ ...form, sponsorType: e.target.value })} className="border p-2 w-full">
          <option>Monetary</option>
          <option>In-Kind</option>
        </select>
        <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="border p-2 w-full" />
        <input type="text" placeholder="Duration (e.g., 6 months)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="border p-2 w-full" />
        <input type="email" placeholder="Contact Email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="border p-2 w-full" />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border p-2 w-full">
          <option>Pending</option>
          <option>Active</option>
          <option>Completed</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Add Sponsorship</button>
      </form>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Existing Sponsors</h3>
        {sponsorships.map((s, index) => (
          <div key={index} className="border p-2 mb-2 rounded">
            <p><strong>Name:</strong> {s.sponsorName}</p>
            <p><strong>Type:</strong> {s.sponsorType}</p>
            <p><strong>Amount:</strong> {s.amount}</p>
            <p><strong>Duration:</strong> {s.duration}</p>
            <p><strong>Email:</strong> {s.contactEmail}</p>
            <p><strong>Status:</strong> {s.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sponsorship;

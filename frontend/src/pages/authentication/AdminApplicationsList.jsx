import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:4000/api/admin/applications')
      .then(res => res.json())
      .then(data => {
        if (data.applications) {
          setApplications(data.applications);
        }
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg("Error fetching applications: " + err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ margin: '20px', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Pending Applications</h2>
      {loading && <p>Loading...</p>}
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {!loading && applications.length === 0 && <p>No pending applications.</p>}
      {!loading && applications.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Full Name</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Email</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Status</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app._id}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{app.fullName}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{app.email}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{app.applicationStatus}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  <Link to={`/admin/applications/${app._id}`} style={{ textDecoration: 'none', color: '#007BFF' }}>View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminApplicationsList;
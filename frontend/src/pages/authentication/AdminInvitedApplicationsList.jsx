import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminInvitedApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch invited applications from the new endpoint
    fetch('http://localhost:4000/api/member-applications/invited')
      .then(res => res.json())
      .then(data => {
        if (data.applications) {
          console.log('Fetched invited applications:', data.applications);
          setApplications(data.applications);
        }
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg('Error fetching invited applications: ' + err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header with Count */}
        <div className="bg-gray-100 p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Invited Applications
            {!loading && applications.length > 0 && (
              <div className="flex justify-center mt-2">
                <span className="text-lg font-medium bg-red-100 text-red-800 py-1 px-3 rounded-full">
                  Invited: {applications.length}
                </span>
              </div>
            )}
          </h2>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-center">
            {errorMsg}
          </div>
        )}

        {/* No Applications */}
        {!loading && applications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7 21a4 4 0 01-4-4V7a4 4 0 014-4h6a4 4 0 014 4v10a4 4 0 01-4 4H7z"
              />
            </svg>
            <p className="text-xl">No invited applications found.</p>
          </div>
        )}

        {/* Table of Applications */}
        {!loading && applications.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {['Full Name', 'Email', 'Status', 'Action'].map(header => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map(app => (
                  <tr
                    key={app._id}
                    className="hover:bg-gray-50 transition duration-300 ease-in-out"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.fullName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{app.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${app.applicationStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                           app.applicationStatus === 'Approved' ? 'bg-green-100 text-green-800' : 
                           'bg-red-100 text-red-800'}`}
                      >
                        {app.applicationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/admin/applications/${app._id}`}
                        className="text-blue-600 hover:text-blue-900 transition duration-300"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInvitedApplicationsList;
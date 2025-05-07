import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

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

  // Export applications list as CSV
  const handleExportCSV = () => {
    const headers = ['Full Name','Email','Contact Number','Birth Date','Age','Dance Style','Experience','Biography','Achievements','Availabilities','Status','Applied Date'];
    const rows = applications.map(app => [
      app.fullName,
      app.email,
      app.contactNumber || '',
      app.birthDate ? format(new Date(app.birthDate),'yyyy-MM-dd') : '',
      app.age || '',
      app.danceStyle,
      app.yearsOfExperience || '',
      app.biography || '',
      (app.achievements||[]).join('; '),
      (app.availability||[]).map(a=>`${a.day} ${a.start}-${a.end}`).join('; '),
      app.applicationStatus,
      app.createdAt ? format(new Date(app.createdAt),'yyyy-MM-dd') : ''
    ]);
    const csvContent = [headers, ...rows].map(r=>r.map(val=>`"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent],{type:'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download='applications.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gray-100 p-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Pending Applications
            {!loading && applications.length > 0 && (
              <div className="flex justify-center mt-2">
                <span className="text-lg font-medium bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full">
                  Pending: {applications.length}
                </span>
              </div>
            )}
          </h2>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-center">
            {errorMsg}
          </div>
        )}

        {!loading && applications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 21a4 4 0 01-4-4V7a4 4 0 014-4h6a4 4 0 014 4v10a4 4 0 01-4 4H7z" />
            </svg>
            <p className="text-xl">No pending applications.</p>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <div className="overflow-x-auto">
            <div className="p-4 flex justify-end">
              <button 
                onClick={handleExportCSV} 
                className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-lg shadow-md hover:from-yellow-600 hover:to-amber-700 transition-all transform hover:scale-105 duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Export Applications CSV
              </button>
            </div>
            
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {['Full Name', 'Email', 'Status', 'Action'].map((header) => (
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
                      to={`/admin/applications/${app._id}/invite`} 
                       className="text-blue-600 hover:text-blue-900 transition duration-300">
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

export default AdminApplicationsList;
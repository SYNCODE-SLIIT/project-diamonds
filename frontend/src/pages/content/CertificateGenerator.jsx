import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import classicBg from '../../assets/templates/Classic.png';
import modernBg from '../../assets/templates/Modern.png';
import elegantBg from '../../assets/templates/Elegant.png';
import creativeBg from '../../assets/templates/Creative.png';
import formalBg from '../../assets/templates/Formal.png';

const CertificateGenerator = () => {
  const [recipientName, setRecipientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [certificates, setCertificates] = useState([]);

  const templateStyles = {
    classic: {
      backgroundImage: `url(${classicBg})`,
      backgroundSize: 'cover',
      color: '#000'
    },
    modern: {
      backgroundImage: `url(${modernBg})`,
      backgroundSize: 'cover',
      color: '#000'
    },
    elegant: {
      backgroundImage: `url(${elegantBg})`,
      backgroundSize: 'cover',
      color: '#333'
    },
    creative: {
      backgroundImage: `url(${creativeBg})`,
      backgroundSize: 'cover',
      color: '#333'
    },
    formal: {
      backgroundImage: `url(${formalBg})`,
      backgroundSize: 'cover',
      color: '#000'
    }
  };

  const handleGenerate = async () => {
    const response = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientName, eventName })
    });
    if (response.ok) {
      fetchCertificates();
      setShowPreview(true);
    }
  };

  const handleDownload = () => {
    html2canvas(document.querySelector('#certificate')).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 90);
      pdf.save('certificate.pdf');
    });
  };

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (err) {
      console.error('Error loading certificates:', err);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">Digital Certificate Generator</h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Recipient Name"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="border-2 border-gray-200 rounded-lg w-full py-2 px-4 focus:ring-2 focus:ring-indigo-200 transition"
          />
          <input
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="border-2 border-gray-200 rounded-lg w-full py-2 px-4 focus:ring-2 focus:ring-indigo-200 transition"
          />
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="border-2 border-gray-200 rounded-lg w-full py-2 px-4 focus:ring-2 focus:ring-indigo-200 transition"
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="elegant">Elegant</option>
            <option value="creative">Creative</option>
            <option value="formal">Formal</option>
          </select>
          <button
            onClick={handleGenerate}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
          >
            Generate Certificate
          </button>
        </div>
        {showPreview && (
          <div className="mt-8 flex flex-col items-center">
            <div
              id="certificate"
              className="w-full max-w-3xl aspect-[2/1] bg-contain bg-no-repeat bg-center rounded-lg shadow-2xl p-6 mb-4 flex flex-col items-center justify-center text-center"
              style={templateStyles[selectedTemplate]}
            >
              <h1 className="text-2xl font-bold">Certificate of Participation</h1>
              <p className="mt-6 text-lg">This is to certify that</p>
              <h2 className="text-xl font-semibold mt-2">{recipientName}</h2>
              <p className="mt-2">has participated in</p>
              <h3 className="text-lg font-medium mt-1">{eventName}</h3>
              <p className="mt-4 text-sm">Issued on: {new Date().toLocaleDateString()}</p>
            </div>
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-medium transition"
            >
              Download PDF
            </button>
          </div>
        )}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-center">Issued Certificates</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="w-full table-auto">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Recipient</th>
                  <th className="p-2 text-left">Event</th>
                  <th className="p-2 text-left">Issued Date</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert, idx) => (
                  <tr key={cert._id} className="border-b">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{cert.recipientName}</td>
                    <td className="p-2">{cert.eventName}</td>
                    <td className="p-2">{new Date(cert.issuedDate).toLocaleDateString()}</td>
                    <td className="p-2">
                      <button
                        onClick={async () => {
                          if (window.confirm('Delete this certificate?')) {
                            await fetch(`/api/certificates/${cert._id}`, { method: 'DELETE' });
                            fetchCertificates();
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                      >Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;

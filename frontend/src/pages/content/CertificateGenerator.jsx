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
      color: '#fff'
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Digital Certificate Generator</h2>
      <input
        type="text"
        placeholder="Recipient Name"
        value={recipientName}
        onChange={(e) => setRecipientName(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Event Name"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <select
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
        className="border p-2 mb-2 w-full"
      >
        <option value="classic">Classic</option>
        <option value="modern">Modern</option>
        <option value="elegant">Elegant</option>
        <option value="creative">Creative</option>
        <option value="formal">Formal</option>
      </select>
      <button onClick={handleGenerate} className="bg-blue-500 text-white px-4 py-2 rounded">
        Generate Certificate
      </button>

      {showPreview && (
        <div className="mt-4">
          <div
            id="certificate"
            className="w-[600px] h-[300px] text-center shadow relative overflow-hidden"
            style={{
              ...templateStyles[selectedTemplate],
              padding: '20px'
            }}
          >
            <h1 className="text-2xl font-bold">Certificate of Participation</h1>
            <p className="mt-6 text-lg">This is to certify that</p>
            <h2 className="text-xl font-semibold mt-2">{recipientName}</h2>
            <p className="mt-2">has participated in</p>
            <h3 className="text-lg font-medium mt-1">{eventName}</h3>
            <p className="mt-4 text-sm">Issued on: {new Date().toLocaleDateString()}</p>
          </div>
          <button onClick={handleDownload} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Download PDF
          </button>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Issued Certificates</h3>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">#</th>
              <th className="p-2 border">Recipient</th>
              <th className="p-2 border">Event</th>
              <th className="p-2 border">Issued Date</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert, idx) => (
              <tr key={cert._id} className="border-b">
                <td className="p-2 border text-center">{idx + 1}</td>
                <td className="p-2 border">{cert.recipientName}</td>
                <td className="p-2 border">{cert.eventName}</td>
                <td className="p-2 border">{new Date(cert.issuedDate).toLocaleDateString()}</td>
                <td className="p-2 border">
                  <button
                    onClick={async () => {
                      if (window.confirm('Delete this certificate?')) {
                        await fetch(`/api/certificates/${cert._id}`, { method: 'DELETE' });
                        fetchCertificates();
                      }
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CertificateGenerator;

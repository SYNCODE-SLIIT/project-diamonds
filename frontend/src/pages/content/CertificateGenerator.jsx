import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CertificateGenerator = () => {
  const [recipientName, setRecipientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    const response = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientName, eventName })
    });
    if (response.ok) setShowPreview(true);
  };

  const handleDownload = () => {
    html2canvas(document.querySelector('#certificate')).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 90);
      pdf.save('certificate.pdf');
    });
  };

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
      <button onClick={handleGenerate} className="bg-blue-500 text-white px-4 py-2 rounded">
        Generate Certificate
      </button>

      {showPreview && (
        <div className="mt-4">
          <div id="certificate" className="border p-4 bg-white w-[600px] h-[300px] text-center shadow">
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
    </div>
  );
};

export default CertificateGenerator;

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { HiOutlineDocumentText, HiOutlineX, HiOutlineUpload, HiOutlineCurrencyDollar, HiOutlineAnnotation, HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUserGroup } from 'react-icons/hi';

const darkBlue = 'bg-[#172554]';
const darkBlueAccent = 'bg-[#1e293b]';
const accentText = 'text-[#2563eb]'; // blue-600
const cardBg = 'bg-white';
const cardText = 'text-gray-900';
const labelText = 'text-blue-900';

const BudgetForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [allocatedBudget, setAllocatedBudget] = useState('');
  const [remainingBudget, setRemainingBudget] = useState('');
  const [reason, setReason] = useState('');
  const [infoFile, setInfoFile] = useState(null);
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axiosInstance.get('/api/finance/events/confirmed');
        setEvents(res.data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setMessage('Error loading events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Validation functions
  const validateAllocatedBudget = () => {
    const parsedBudget = parseFloat(allocatedBudget);
    return !isNaN(parsedBudget) && parsedBudget > 0 && parsedBudget <= 1000000;
  };

  const validateRemainingBudget = () => {
    const parsedAllocated = parseFloat(allocatedBudget);
    const parsedRemaining = parseFloat(remainingBudget);
    return (
      !isNaN(parsedRemaining) &&
      parsedRemaining >= 0 &&
      parsedRemaining <= parsedAllocated
    );
  };

  const validateReason = () => reason.trim().length >= 10 && reason.trim().length <= 500;

  const validateInfoFile = () => {
    return infoFile && (infoFile.type === 'image/png' || infoFile.type === 'application/pdf');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/png', 'application/pdf'];
      if (validTypes.includes(file.type)) {
        setInfoFile(file);
        setMessage('');
        if (file.type === 'application/pdf') {
          setFilePreview('pdf');
        } else {
          setFilePreview(URL.createObjectURL(file));
        }
      } else {
        setInfoFile(null);
        setFilePreview(null);
        setMessage('Invalid file type. Please upload PNG or PDF.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    if (!validateAllocatedBudget()) {
      setMessage('Invalid allocated budget amount');
      setIsSubmitting(false);
      return;
    }

    if (!validateRemainingBudget()) {
      setMessage('Invalid remaining budget amount');
      setIsSubmitting(false);
      return;
    }

    if (!validateReason()) {
      setMessage('Reason must be between 10 and 500 characters');
      setIsSubmitting(false);
      return;
    }

    if (!validateInfoFile()) {
      setMessage('Invalid file. Please upload a PNG or PDF file.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('allocatedBudget', allocatedBudget);
      formData.append('remainingBudget', remainingBudget);
      formData.append('status', status);
      formData.append('reason', reason);
      formData.append('infoFile', infoFile);
      formData.append('event', selectedEvent._id);

      const res = await axiosInstance.post('/api/finance/cb', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(res.data.message || 'Budget request created successfully');
      setAllocatedBudget('');
      setRemainingBudget('');
      setReason('');
      setInfoFile(null);
      setFilePreview(null);
      setSelectedEvent(null);
      setStep(1);
    } catch (error) {
      console.error('Error creating budget:', error);
      setMessage('Error creating budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format date/time
  const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`shadow-2xl rounded-2xl w-full max-w-5xl relative animate-fadein border border-white/10 ${cardBg}`}> 
        <div className={`flex items-center justify-between bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 p-6 rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <HiOutlineDocumentText className="text-blue-200 text-3xl" />
            </div>
            <h2 className="text-2xl font-bold text-white">Budget Request</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white bg-red-500/80 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center transition duration-300 backdrop-blur-sm"
              title="Close"
            >
              <HiOutlineX className="text-xl" />
            </button>
          )}
        </div>
        <div className="p-8">
          {step === 1 ? (
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-blue-900 mb-6">Select Event</h3>
              {loading ? (
                <div className="text-center py-4 text-blue-700">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="text-center py-4 text-blue-700">No confirmed events available</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {events.map(event => (
                    <div
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-4 mb-4 mx-2 border rounded-xl cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                        selectedEvent?._id === event._id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-blue-200 hover:border-blue-400 bg-white'
                      }`}
                      style={{ minHeight: '120px' }}
                    >
                      <div className="flex gap-3">
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={event.packageID?.image || 'https://via.placeholder.com/150'}
                            alt={event.eventName}
                            className="w-full h-full object-cover rounded-lg shadow-md"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 text-base mb-1">{event.eventName}</h4>
                          <div className="space-y-1 text-xs text-blue-800">
                            <div className="flex items-center gap-2">
                              <HiOutlineCalendar className="text-blue-600" />
                              <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HiOutlineLocationMarker className="text-blue-600" />
                              <span>{event.eventLocation}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HiOutlineUserGroup className="text-blue-600" />
                              <span>{event.guestCount} Guests</span>
                            </div>
                            {event.packageID && (
                              <div className="text-xs text-blue-700">Package: {event.packageID.name}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedEvent}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-7 py-2.5 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl text-lg"
                >
                  Next Step
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Event Info */}
              <div className={`rounded-xl p-8 shadow-md flex flex-col items-center justify-center min-h-[480px] ${cardBg} ${cardText}`}> 
                <div className="w-32 h-32 rounded-xl bg-blue-100 shadow flex items-center justify-center mb-6">
                  <img
                    src={selectedEvent.packageID?.image || 'https://via.placeholder.com/150'}
                    alt={selectedEvent.eventName}
                    className="w-28 h-28 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-blue-900">{selectedEvent.eventName}</h3>
                <div className="mb-2 flex items-center gap-2 text-blue-800">
                  <HiOutlineCalendar className="text-blue-600" />
                  <span>{new Date(selectedEvent.eventDate).toLocaleDateString()}</span>
                </div>
                <div className="mb-2 flex items-center gap-2 text-blue-800">
                  <HiOutlineLocationMarker className="text-blue-600" />
                  <span>{selectedEvent.eventLocation}</span>
                </div>
                <div className="mb-2 flex items-center gap-2 text-blue-800">
                  <HiOutlineUserGroup className="text-blue-600" />
                  <span>{selectedEvent.guestCount} Guests</span>
                </div>
                {selectedEvent.packageID && (
                  <div className="text-blue-700 mt-2">Package: {selectedEvent.packageID.name}</div>
                )}
                {selectedEvent.additionalRequests && selectedEvent.additionalRequests.trim() && (
                  <div className="mt-4 w-full text-sm text-blue-900 bg-blue-50 rounded p-2">Additional Requests: <span className="text-blue-800">{selectedEvent.additionalRequests}</span></div>
                )}
                {selectedEvent.approvedBy && (
                  <div className="mt-2 w-full text-xs text-blue-700">Approved By: <span className="text-blue-800">{selectedEvent.approvedBy}</span></div>
                )}
                {selectedEvent.approvedAt && (
                  <div className="w-full text-xs text-blue-700">Approved At: <span className="text-blue-800">{formatDateTime(selectedEvent.approvedAt)}</span></div>
                )}
                {selectedEvent.additionalServices && selectedEvent.additionalServices.length > 0 && (
                  <div className="mt-4 w-full">
                    <div className="text-xs text-blue-700 mb-1">Additional Services:</div>
                    <ul className="list-disc list-inside text-blue-800">
                      {selectedEvent.additionalServices.map((srv, idx) => (
                        <li key={idx}>
                          {srv.serviceID?.serviceName || 
                           srv.serviceID?.name || 
                           srv.serviceID?.description || 
                           srv.serviceID?.category || 
                           'Service'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* Right: Budget Form */}
              <form onSubmit={handleSubmit} className={`space-y-7 ${cardText}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
                    <label htmlFor="allocatedBudget" className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${labelText}`}>
                      <HiOutlineCurrencyDollar className="text-blue-600" /> Allocated Budget
            </label>
            <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-blue-700">RS.</span>
              <input
                type="number"
                id="allocatedBudget"
                value={allocatedBudget}
                onChange={(e) => setAllocatedBudget(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-300 text-lg bg-blue-50 placeholder-blue-400 text-blue-900"
                min="0.01"
                step="0.01"
                required
                placeholder="Enter allocated budget"
              />
            </div>
          </div>
          <div>
                    <label htmlFor="remainingBudget" className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${labelText}`}>
                      <HiOutlineCurrencyDollar className="text-blue-600" /> Remaining Budget
            </label>
            <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-blue-700">RS.</span>
              <input
                type="number"
                id="remainingBudget"
                value={remainingBudget}
                onChange={(e) => setRemainingBudget(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-300 text-lg bg-blue-50 placeholder-blue-400 text-blue-900"
                min="0"
                step="0.01"
                required
                placeholder="Enter remaining budget"
              />
            </div>
          </div>
                </div>
          <div>
                  <label htmlFor="reason" className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${labelText}`}>
                    <HiOutlineAnnotation className="text-blue-600" /> Reason for Budget Request
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-3 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition duration-300 text-base h-32 bg-blue-50 placeholder-blue-400 text-blue-900"
              placeholder="Provide a detailed reason (10-500 characters)"
              required
            />
          </div>
          <div>
                  <label htmlFor="infoFile" className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${labelText}`}>
                    <HiOutlineUpload className="text-blue-600" /> Upload Supporting Document (PNG or PDF)
            </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-blue-200 border-dashed rounded-xl hover:border-blue-600 transition-colors duration-200 bg-blue-50">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-blue-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-blue-700">
                        <label
                          htmlFor="infoFile"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-600"
                        >
                          <span>Upload a file</span>
            <input
                            id="infoFile"
              type="file"
              accept="image/png,application/pdf"
              onChange={handleFileChange}
                            className="sr-only"
              required
            />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-blue-600">PNG or PDF up to 10MB</p>
                    </div>
                  </div>
            {filePreview && (
              <div className="mt-3">
                {filePreview === 'pdf' ? (
                        <div className="flex items-center gap-2 text-blue-900 bg-blue-50 p-3 rounded-xl border border-blue-200">
                          <HiOutlineDocumentText className="text-2xl text-blue-600" />
                    <span>PDF selected: {infoFile?.name}</span>
                  </div>
                ) : (
                        <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-xl border border-blue-200">
                          <img src={filePreview} alt="Preview" className="h-16 w-16 object-contain rounded-lg shadow" />
                    <span>{infoFile?.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-blue-100 text-blue-900 px-7 py-2.5 rounded-xl font-semibold hover:bg-blue-200 transition duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl text-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
          <button
            type="submit"
            disabled={isSubmitting}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-7 py-2.5 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Submit Budget Request'
                    )}
          </button>
                </div>
        {message && (
                  <div className="pt-4">
                    <div className={`p-3 rounded-xl mt-2 ${
              message.includes('Error')
                        ? 'bg-red-100 border-l-4 border-red-500 text-red-700'
                        : 'bg-blue-100 border-l-4 border-blue-600 text-blue-900'
            }`}>
              <p>{message}</p>
            </div>
          </div>
        )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetForm;

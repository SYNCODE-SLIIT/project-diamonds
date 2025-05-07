import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RLNWSBQXXSnGHVne1MFnmzxcF0IY17GvEMyUvicd7fKTnquRWnYATbEDKDGTHdwDPfVBwiWkiXFVEVhRl5fBjec00DSMmLONN');

function generateOrderId() {
  return 'TKT-' + Math.floor(10000 + Math.random() * 90000);
}

const StripePaymentForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      // Create payment intent on the server
      const { data: clientSecret } = await axiosInstance.post('/api/stripe/create-payment-intent', {
        amount: amount * 100, // Convert to cents
      });

      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (stripeError) {
        setError(stripeError.message);
        onError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (err) {
      setError(err.message);
      onError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay LKR ${amount}`}
      </button>
    </form>
  );
};

const TicketPaymentForm = ({ ticket, onClose, onSuccess }) => {
  const userAuth = typeof useUserAuth === 'function' ? useUserAuth() : {};
  const user = userAuth?.user || null;
  const [step, setStep] = useState(1);
  const [orderId] = useState(generateOrderId());
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('bankslip');
  const [form, setForm] = useState({
    fullName: '',
    contact: '',
    email: '',
    slip: null,
    slipPreview: '',
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Calculate total
  const totalAmount = (ticket.price || 0) * quantity;

  // File validation
  const validateSlip = (file) => {
    if (!file) return 'Bank slip is required.';
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) return 'Invalid file format. Only JPEG, PNG, or PDF allowed.';
    if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB.';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSlipChange = (e) => {
    const file = e.target.files[0];
    const error = validateSlip(file);
    setErrors((prev) => ({ ...prev, slip: error }));
    if (!error && file) {
      setForm((prev) => ({ ...prev, slip: file }));
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setForm((prev) => ({ ...prev, slipPreview: ev.target.result }));
        reader.readAsDataURL(file);
      } else {
        setForm((prev) => ({ ...prev, slipPreview: '' }));
      }
    } else {
      setForm((prev) => ({ ...prev, slip: null, slipPreview: '' }));
    }
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!form.contact.trim()) newErrors.contact = 'Contact number is required.';
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Valid email is required.';
    if (paymentMethod === 'bankslip') {
      const slipError = validateSlip(form.slip);
      if (slipError) newErrors.slip = slipError;
      if (!form.confirm) newErrors.confirm = 'You must confirm the slip is valid.';
    }
    return newErrors;
  };

  // Handle Stripe payment success
  const handleStripeSuccess = async (paymentIntent) => {
    try {
      await axiosInstance.post('/api/stripe/successful-payment', {
        paymentIntentId: paymentIntent.id,
        amount: totalAmount,
        paymentMethod: 'stripe',
        ticketId: ticket._id || ticket.id,
        ticketName: ticket.name,
        quantity: quantity,
        orderId: orderId,
        paymentFor: 'ticket'
      });

      setReferenceId(paymentIntent.id);
      setStep(3);
    } catch (err) {
      setErrors({ submit: 'Failed to record payment. Please contact support.' });
    }
  };

  // Handle Stripe payment error
  const handleStripeError = (error) => {
    setErrors({ submit: error });
  };

  // Handle bank slip submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitting(true);
      try {
        if (paymentMethod === 'bankslip') {
          const formData = new FormData();
          formData.append('ticketId', ticket._id || ticket.id);
          formData.append('ticketName', ticket.name);
          formData.append('quantity', quantity);
          formData.append('amount', totalAmount);
          formData.append('fullName', form.fullName);
          formData.append('email', form.email);
          formData.append('contact', form.contact);
          formData.append('orderId', orderId);
          if (form.slip) formData.append('bankSlip', form.slip);
          formData.append('paymentMethod', 'bank_slip');
          formData.append('paymentFor', 'ticket');

          await axiosInstance.post('/api/finance/tp', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          setReferenceId(generateOrderId());
          setStep(3);
        }
      } catch (err) {
        setErrors({ ...newErrors, submit: 'Payment failed. Please try again.' });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const checkPaymentStatus = async () => {
    setStatusLoading(true);
    setPaymentStatus(null);
    try {
      const res = await axiosInstance.get(`/api/finance/payment-status/${orderId}`);
      setPaymentStatus(res.data.status);
    } catch (err) {
      setPaymentStatus('Error fetching status');
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    const redirectToStripe = async () => {
      setRedirecting(true);
      try {
        const { data } = await axiosInstance.post('/api/stripe/create-checkout-session', {
          amount: ticket.price * 100, // price per item in cents
          ticketName: ticket.name,
          userEmail: form.email,
          orderId,
          quantity,
          ticketId: ticket._id || ticket.id,
          currency: 'lkr',
          successUrl: window.location.origin + '/payment-success',
          cancelUrl: window.location.origin + '/ticket-payment-cancel',
        });
        window.location.href = data.url;
      } catch (err) {
        setRedirecting(false);
      }
    };
    if (paymentMethod === 'stripe' && !redirecting) {
      redirectToStripe();
    }
  }, [paymentMethod]);

  // Step 1: Ticket Details
  if (step === 1) {
    return (
      <div style={{background: 'rgba(0,0,0,0.2)'}} className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="max-w-lg w-full bg-white shadow-2xl rounded-3xl p-10 relative border border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mb-6">
            <div className="text-xs text-gray-500 mb-2">Step 1 of 2</div>
            <h2 className="text-3xl font-extrabold mb-2 text-[#0a174e]">Ticket Details</h2>
            <p className="text-gray-600 text-base">Review your ticket information before proceeding to payment.</p>
          </div>
          <div className="mb-8 p-6 bg-[#f8fafc] rounded-2xl border border-gray-300 shadow-sm">
            <div className="font-bold text-xl text-[#133b5c] mb-2">{ticket.name}</div>
            <div className="flex items-center mb-4">
              <span className="font-medium text-gray-700 mr-2">Price:</span>
              <span className="font-bold text-lg text-[#4f46e5]">LKR {ticket.price.toLocaleString()}</span>
            </div>
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-24 border rounded-lg px-3 py-2 text-center text-lg font-semibold focus:ring-2 focus:ring-[#f4d160] focus:outline-none bg-white shadow"
              />
            </div>
            <div className="flex items-center mt-2">
              <span className="font-medium text-gray-700 mr-2">Total:</span>
              <span className="font-bold text-lg text-[#16a34a]">LKR {(ticket.price * quantity).toLocaleString()}</span>
            </div>
          </div>
          <button
            className="w-full bg-gradient-to-r from-[#4f46e5] to-[#f4d160] hover:from-[#4338ca] hover:to-[#f4d160]/80 text-white font-bold py-3 rounded-xl mt-4 text-lg shadow-lg transition-all duration-200"
            onClick={() => setStep(2)}
          >
            Next: Payment Details
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Payment details
  if (step === 2) {
    return (
      <div style={{background: 'rgba(0,0,0,0.2)'}} className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="max-w-6xl w-full bg-white shadow-xl rounded-2xl p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side - Ticket Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-32 h-32 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <div className="text-4xl">🎟️</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{ticket.name}</h3>
                  <p className="text-gray-600 mt-2">Event Ticket</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Price</span>
                  <span className="text-lg font-semibold text-gray-900">LKR {ticket.price?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Quantity</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-20 border rounded px-3 py-2 text-center text-lg font-semibold"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total</span>
                  <span className="text-xl font-bold text-green-600">LKR {(totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right side - Payment Form */}
            <div className="relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-bold text-lg mb-3">Payment Method</label>
                  <div className="flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="bankslip"
                        checked={paymentMethod === 'bankslip'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2 accent-green-600"
                      />
                      <span className="text-base">Bank Slip</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-2 accent-blue-600"
                      />
                      <span className="text-base">Card / Online Payment</span>
                    </label>
                  </div>
                </div>

                <div className="relative min-h-[350px]">
                  <div className={`transition-all duration-500 ${paymentMethod === 'bankslip' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 absolute pointer-events-none'}`}>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                      <div className="col-span-2">
                        <label className="block font-medium mb-1">Order ID</label>
                        <input className="w-full border rounded px-3 py-2 bg-gray-100" value={orderId} readOnly />
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input
                          className={`w-full border rounded px-3 py-2 ${errors.fullName ? 'border-red-400' : ''}`}
                          name="fullName"
                          placeholder="Enter your full name"
                          value={form.fullName}
                          onChange={handleInputChange}
                          readOnly={!!user}
                        />
                        {errors.fullName && <div className="text-red-500 text-sm mt-1">{errors.fullName}</div>}
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Contact Number <span className="text-red-500">*</span></label>
                        <input
                          className={`w-full border rounded px-3 py-2 ${errors.contact ? 'border-red-400' : ''}`}
                          name="contact"
                          placeholder="Enter your contact number"
                          value={form.contact}
                          onChange={handleInputChange}
                        />
                        {errors.contact && <div className="text-red-500 text-sm mt-1">{errors.contact}</div>}
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
                        <input
                          className={`w-full border rounded px-3 py-2 ${errors.email ? 'border-red-400' : ''}`}
                          name="email"
                          placeholder="Enter your email address"
                          value={form.email}
                          onChange={handleInputChange}
                          readOnly={!!user}
                        />
                        {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                      </div>
                      <div>
                        <label className="block font-medium mb-1">Upload Bank Slip <span className="text-red-500">*</span></label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          onChange={handleSlipChange}
                          className={`w-full border rounded px-3 py-2 ${errors.slip ? 'border-red-400' : ''}`}
                        />
                        <div className="text-xs text-gray-500 mt-1">Max size: 5MB. JPEG, PNG, or PDF only.</div>
                        {errors.slip && <div className="text-red-500 text-sm mt-1">{errors.slip}</div>}
                        {form.slipPreview && (
                          <div className="mt-2">
                            <div className="text-xs text-gray-600 mb-1">Slip Preview:</div>
                            <img src={form.slipPreview} alt="Slip Preview" className="h-24 rounded border" />
                          </div>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm text-gray-700 mb-1">Note:</label>
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          Upload a copy of your bank slip showing the transaction for <span className="font-semibold">{ticket.name}</span>. Ensure the beneficiary name matches your order details.
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <input
                          type="checkbox"
                          name="confirm"
                          checked={form.confirm}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm">I confirm the uploaded slip is valid and matches my payment.</span>
                      </div>
                      {errors.confirm && <div className="col-span-2 text-red-500 text-sm mb-2">{errors.confirm}</div>}
                      <div className="col-span-2">
                        <button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg mt-2 transition flex items-center justify-center text-lg shadow"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                          ) : null}
                          {submitting ? 'Processing...' : 'Submit Payment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              {paymentMethod === 'stripe' && (
                <div className="flex items-center justify-center h-full w-full absolute top-0 left-0 bg-white bg-opacity-80 z-10">
                  <div className="text-lg text-gray-700 font-semibold flex items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Redirecting to secure Stripe payment...
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-400 text-center">Uploaded slips are only used for payment verification and deleted after 30 days.</div>
        </div>
      </div>
    );
  }

  // Step 3: Confirmation
  return (
    <div style={{background: 'rgba(0,0,0,0.2)'}} className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-green-700">Thank you!</h2>
          <p className="text-gray-700">Your payment has been submitted for <span className="font-semibold">{ticket.name}</span>.</p>
        </div>
        <div className="mb-4">
          <div className="font-semibold">Reference ID:</div>
          <div className="text-lg font-bold text-indigo-700 mb-2">{referenceId}</div>
          <div className="font-semibold">Order ID:</div>
          <div className="text-lg font-bold text-gray-700 mb-2">{orderId}</div>
          <div className="font-semibold">Quantity:</div>
          <div className="text-lg font-bold text-gray-700 mb-2">{quantity}</div>
          <div className="font-semibold">Total Paid:</div>
          <div className="text-lg font-bold text-green-700 mb-2">LKR {(totalAmount).toLocaleString()}</div>
        </div>
        {form.slipPreview && paymentMethod === 'bankslip' && (
          <div className="mb-4">
            <div className="text-xs text-gray-600 mb-1">Slip Preview:</div>
            <img src={form.slipPreview} alt="Slip Preview" className="h-24 rounded border mx-auto" />
          </div>
        )}
        <div className="mb-4 text-green-700 font-medium">Your payment will be verified within 24 hours.</div>
        <a
          href="#"
          onClick={e => { e.preventDefault(); checkPaymentStatus(); }}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition mb-2"
        >
          Check Payment Status
        </a>
        {statusLoading && <div>Checking status...</div>}
        {paymentStatus && <div className="mt-2 font-bold">Status: {paymentStatus}</div>}
        <div className="text-xs text-gray-400 mt-4">Uploaded slips are only used for payment verification and deleted after 30 days.</div>
        <div className="mt-6">
          <button
            className="text-indigo-600 underline text-sm"
            onClick={() => window.location.reload()}
          >
            Make another payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketPaymentForm;
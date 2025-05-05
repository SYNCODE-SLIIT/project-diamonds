import React, { useState, useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RLNWSBQXXSnGHVne1MFnmzxcF0IY17GvEMyUvicd7fKTnquRWnYATbEDKDGTHdwDPfVBwiWkiXFVEVhRl5fBjec00DSMmLONN');

const DUMMY_PACKAGES = [
  {
    id: 'pkg1',
    name: 'Test Package',
    price: 99.99,
    description: 'A basic starter merchandise pack.',
    quantity: 1,
  },
  {
    id: 'pkg2',
    name: 'Premium Bundle',
    price: 199.0,
    description: 'Premium bundle with exclusive items.',
    quantity: 1,
  },
];

function generateOrderId() {
  return 'ORD-' + Math.floor(10000 + Math.random() * 90000);
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
        {processing ? 'Processing...' : `Pay RS. ${amount}`}
      </button>
    </form>
  );
};

const StripeCheckoutButton = ({ amount, productName, userEmail, orderId, quantity, productId, productImage, currency, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.post('/api/stripe/create-checkout-session', {
        amount: amount * 100, // cents
        productName,
        userEmail,
        orderId,
        quantity,
        productId,
        productImage,
        currency,
        successUrl: window.location.origin + '/payment-success',
        cancelUrl: window.location.origin + '/payment-cancel',
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to redirect to Stripe Checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl p-6 max-w-md mx-auto w-full">
      <div className="flex flex-col items-center mb-6">
        <img src="/logo192.png" alt="Brand Logo" className="w-16 h-16 mb-2" />
        <h2 className="text-3xl font-bold text-gray-800 text-center">Stripe Payment</h2>
        <p className="text-gray-500 text-center mt-1">Pay securely using Stripe</p>
      </div>
      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Redirecting...
          </>
        ) : (
          `Pay with Card`
        )}
      </button>
      <div className="mt-6 flex justify-center">
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 underline text-sm focus:outline-none"
          type="button"
        >
          Cancel / Close
        </button>
      </div>
    </div>
  );
};

const MerchandisePaymentForm = ({ product, onClose }) => {
  const userAuth = typeof useUserAuth === 'function' ? useUserAuth() : {};
  const user = userAuth?.user || null;
  const [step, setStep] = useState(product ? 2 : 1);
  const [selectedPackage, setSelectedPackage] = useState(product || DUMMY_PACKAGES[0]);
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
  const totalAmount = (selectedPackage.price || 0) * quantity;

  // File validation
  const validateSlip = (file) => {
    if (!file) return 'Bank slip is required.';
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) return 'Invalid file format. Only JPEG, PNG, or PDF allowed.';
    if (file.size > 5 * 1024 * 1024) return 'File size must be less than 5MB.';
    return '';
  };

  // Step 1: Package selection
  const handlePackageChange = (e) => {
    const pkg = DUMMY_PACKAGES.find((p) => p.id === e.target.value);
    setSelectedPackage(pkg);
  };

  // Step 2: Form input
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
        productId: selectedPackage._id || selectedPackage.id,
        productName: selectedPackage.name,
        quantity: quantity,
        orderId: orderId,
        paymentFor: 'merchandise'
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

  // Step 2: Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setSubmitting(true);
      try {
        if (paymentMethod === 'bankslip') {
          const formData = new FormData();
          formData.append('productId', selectedPackage._id || selectedPackage.id);
          formData.append('productName', selectedPackage.name);
          formData.append('quantity', quantity);
          formData.append('amount', totalAmount);
          formData.append('fullName', form.fullName);
          formData.append('email', form.email);
          formData.append('contact', form.contact);
          formData.append('orderId', orderId);
          if (form.slip) formData.append('bankSlip', form.slip);
          formData.append('paymentMethod', 'bank_slip');
          formData.append('paymentFor', 'merchandise');

          await axiosInstance.post('/api/finance/mp', formData, {
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

  // Step 1: Package selection (skip if product is provided)
  if (!product && step === 1) {
    return (
      <div className="max-w-lg mx-auto bg-white shadow-xl rounded-2xl p-8 mt-8 mb-8">
        <div className="mb-6">
          <div className="text-xs text-gray-500 mb-2">Step 1 of 2</div>
          <h2 className="text-2xl font-bold mb-2">Select Merchandise Package</h2>
          <p className="text-gray-600">Choose a package to buy. Details will auto-fill below.</p>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Package</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedPackage.id}
            onChange={handlePackageChange}
          >
            {DUMMY_PACKAGES.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4 p-4 bg-gray-50 rounded border">
          <div className="font-semibold text-lg">{selectedPackage.name}</div>
          <div className="text-gray-700">{selectedPackage.description}</div>
          <div className="mt-2">Price: <span className="font-bold text-indigo-700">${selectedPackage.price.toFixed(2)}</span></div>
          <div>Quantity: <span className="font-bold">{selectedPackage.quantity}</span></div>
          <div className="mt-2">Total: <span className="font-bold text-green-700 text-lg">${(selectedPackage.price * selectedPackage.quantity).toFixed(2)}</span></div>
        </div>
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg mt-4 transition"
          onClick={() => setStep(2)}
        >
          Next: Payment Details
        </button>
      </div>
    );
  }

  // Step 2: Payment details
  if (step === 2) {
    return (
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8 mt-8 mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Package Details */}
          <div className="flex-1 flex flex-col items-center md:items-start justify-center">
            {selectedPackage.image && (
              <img
                src={selectedPackage.image}
                alt={selectedPackage.name}
                className="w-full max-w-xs md:max-w-sm h-auto rounded-xl border mb-4 object-cover"
                style={{ maxHeight: '340px', minHeight: '220px', background: '#f3f4f6' }}
              />
            )}
            <div className="text-xs text-gray-500 mb-1">Step 2 of 2</div>
            <h2 className="text-2xl font-bold mb-1">{selectedPackage.name}</h2>
            <div className="text-gray-700 text-sm mb-1">{selectedPackage.description}</div>
            <div className="text-indigo-700 font-bold">LKR {selectedPackage.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <div className="text-gray-600 flex items-center gap-2">Qty:
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-16 border rounded px-2 py-1 ml-2 text-center"
                style={{ width: '60px' }}
              />
            </div>
            <div className="text-green-700 font-bold mt-1">Total: LKR {(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <button
              className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-semibold"
              onClick={() => setStep(1)}
              type="button"
            >
              ← Back
            </button>
          </div>
          {/* Right: Payment Form */}
          <div className="flex-1">
            <div className="mb-6">
              <label className="block font-medium mb-2">Payment Method</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="bankslip"
                    checked={paymentMethod === 'bankslip'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Bank Slip
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Credit Card (Stripe)
                </label>
              </div>
            </div>
            {paymentMethod === 'bankslip' ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block font-medium mb-1">Order ID</label>
                  <input className="w-full border rounded px-3 py-2 bg-gray-100" value={orderId} readOnly />
                </div>
                <div className="mb-4">
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
                <div className="mb-4">
                  <label className="block font-medium mb-1">Contact Number <span className="text-red-500">*</span></label>
                  <input
                    className={`w-full border rounded px-3 py-2 ${errors.contact ? 'border-red-400' : ''}`}
                    name="contact"
                    placeholder="Enter your contact number here"
                    value={form.contact}
                    onChange={handleInputChange}
                  />
                  {errors.contact && <div className="text-red-500 text-sm mt-1">{errors.contact}</div>}
                </div>
                <div className="mb-4">
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
                <div className="mb-4">
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
                <div className="mb-4">
                  <label className="block text-sm text-gray-700 mb-1">Note:</label>
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    Upload a copy of your bank slip showing the transaction for <span className="font-semibold">{selectedPackage.name}</span>. Ensure the beneficiary name matches your order details.
                  </div>
                </div>
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="confirm"
                    checked={form.confirm}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm">I confirm the uploaded slip is valid and matches my payment.</span>
                </div>
                {errors.confirm && <div className="text-red-500 text-sm mb-2">{errors.confirm}</div>}
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg mt-2 transition flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  ) : null}
                  {submitting ? 'Processing...' : 'Submit Payment'}
                </button>
              </form>
            ) : (
              <StripeCheckoutButton
                amount={totalAmount}
                productName={selectedPackage.name}
                userEmail={form.email}
                orderId={orderId}
                quantity={quantity}
                productId={selectedPackage._id || selectedPackage.id}
                productImage={selectedPackage.image || ''}
                currency={'lkr'}
                onClose={onClose}
              />
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-between text-xs text-gray-500">
          <span>Step 1: Select Package</span>
          <span>→</span>
          <span className="font-semibold text-green-700">Step 2: Payment</span>
        </div>
        <div className="mt-4 text-xs text-gray-400">Uploaded slips are only used for payment verification and deleted after 30 days.</div>
      </div>
    );
  }

  // Step 3: Confirmation
  return (
    <div className="max-w-lg mx-auto bg-white shadow-xl rounded-2xl p-8 mt-8 mb-8 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-green-700">Thank you!</h2>
        <p className="text-gray-700">Your payment has been submitted for <span className="font-semibold">{selectedPackage.name}</span>.</p>
      </div>
      <div className="mb-4">
        <div className="font-semibold">Reference ID:</div>
        <div className="text-lg font-bold text-indigo-700 mb-2">{referenceId}</div>
        <div className="font-semibold">Order ID:</div>
        <div className="text-lg font-bold text-gray-700 mb-2">{orderId}</div>
        <div className="font-semibold">Quantity:</div>
        <div className="text-lg font-bold text-gray-700 mb-2">{quantity}</div>
        <div className="font-semibold">Total Paid:</div>
        <div className="text-lg font-bold text-green-700 mb-2">LKR {(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
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
  );
};

export default MerchandisePaymentForm; 
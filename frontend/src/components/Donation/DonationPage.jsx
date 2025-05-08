import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logos/logo.jpeg';
import { loadStripe } from '@stripe/stripe-js';
import DonationBg from '../../assets/images/DonationBg.jpeg';

const PROJECTS = [
  "General Fund Project",
  "Diamonds Youth Camp",
  "Dance Education",
  "New Choreography",
  "Scholarship",
  "Women of Diamonds"
];

const DonationPage = ({ onClose }) => {
  const navigate = useNavigate ? useNavigate() : null;
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [supportProject, setSupportProject] = useState(PROJECTS[0]);
  const [dedicate, setDedicate] = useState('');
  const [comment, setComment] = useState('');
  const [showDedicate, setShowDedicate] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');
  // Add these lines for donor info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [coverFees, setCoverFees] = useState(false);
  const predefinedAmounts = [500, 1000, 2500, 5000, 10000, 20000];
  const [showBankSlipModal, setShowBankSlipModal] = useState(false);

  const handleClose = () => {
    if (onClose) onClose();
    if (navigate) navigate('/');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) {
      setIsProcessing(true);
      // Here you would trigger payment logic
      setTimeout(() => {
        setIsProcessing(false);
        handleClose();
      }, 1200);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else handleClose();
  };

  const filteredProjects = PROJECTS.filter(p =>
    p.toLowerCase().includes(projectSearch.toLowerCase())
  );

  // Move these INSIDE the component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const handleStripePayment = async () => {
  setIsProcessing(true);
  try {
    const response = await fetch('http://localhost:4000/api/stripe/create-donation-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Number(amount),
        currency,
        firstName,
        lastName,
        email,
        phone,
        supportProject,
        dedicate,
        comment,
        coverFees,
      }),
    });
    const data = await response.json();
    if (!data.sessionId) throw new Error('Failed to create Stripe session');

    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  } catch (err) {
    alert('Stripe payment failed: ' + err.message);
    setIsProcessing(false);
  }
};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm"
      style={{
        backgroundImage: `url(${DonationBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close donation form"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-0">
            <div className="flex flex-col items-center pt-6">
              <img src={logo} alt="Team Diamond Logo" className="h-12 w-12 rounded mx-auto mb-2" />
              <h2 className="text-lg font-semibold mb-2">Donate to Team Diamonds</h2>
            </div>
            <form onSubmit={handleContinue} className="px-6">
              {step === 1 && (
                <>
                  <div className="bg-gray-100 rounded-lg mx-0 mt-2 mb-4 py-3 flex flex-col items-center">
                    <span className="text-sm font-medium">Choose your donation amount</span>
                  </div>
                  <div className="flex items-center mb-4">
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="bg-transparent text-base font-semibold outline-none border rounded-l px-2 py-2"
                    >
                      <option value="LKR">LKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                    <span className="mx-2 text-lg font-bold">
                      {currency === 'LKR' ? 'රු' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-transparent outline-none text-base border rounded-r px-2 py-2"
                      style={{ minWidth: 0 }}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {predefinedAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        className={`py-2 text-base font-semibold rounded-md border ${Number(amount) === amt ? 'border-black bg-gray-100' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                        onClick={() => setAmount(amt)}
                      >
                        {currency === 'LKR' ? 'රු' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                        {amt.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={!amount}
                    className={`w-full py-3 mt-2 rounded-lg text-lg font-bold ${!amount ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}
                  >
                    Next
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="bg-gray-100 rounded-lg mx-0 mt-2 mb-4 py-3 flex flex-col items-center">
                    <span className="text-sm font-medium">Donation: {currency === 'LKR' ? 'රු' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}{amount}</span>
                  </div>
                  {/* Support Project */}
                  <button
                    type="button"
                    className="w-full flex items-center py-3 border-b"
                    onClick={() => setShowProjectModal(true)}
                  >
                    <span className="mr-3 text-2xl">🎁</span>
                    <span className="flex-1 text-left">
                      <span className="font-semibold">I&apos;d like to support</span>
                      <br />
                      <span className="text-xs text-gray-500">{supportProject}</span>
                    </span>
                    <span className="text-xl text-gray-400">&#8250;</span>
                  </button>
                  {/* Dedicate my donation */}
                  <button
                    type="button"
                    className="w-full flex items-center py-3 border-b"
                    onClick={() => setShowDedicate((v) => !v)}
                  >
                    <span className="mr-3 text-2xl">👨‍👩‍👧‍👦</span>
                    <span className="flex-1 text-left font-semibold">Dedicate my donation</span>
                    <span className="text-xl text-gray-400">&#8250;</span>
                  </button>
                  {showDedicate && (
                    <div className="mb-2">
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                        placeholder="Name to dedicate to"
                        value={dedicate}
                        onChange={e => setDedicate(e.target.value)}
                      />
                    </div>
                  )}
                  {/* Leave a comment */}
                  <button
                    type="button"
                    className="w-full flex items-center py-3 border-b"
                    onClick={() => setShowComment((v) => !v)}
                  >
                    <span className="mr-3 text-2xl">💬</span>
                    <span className="flex-1 text-left font-semibold">Leave a comment</span>
                    <span className="text-xl text-gray-400">&#8250;</span>
                  </button>
                  {showComment && (
                    <div className="mb-2">
                      <textarea
                        className="w-full border rounded px-3 py-2 mt-1 text-sm"
                        placeholder="Your comment"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="py-2 px-4 rounded-lg bg-gray-200 text-gray-700 font-semibold"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="py-2 px-6 rounded-lg text-lg font-bold bg-black text-white hover:bg-gray-900"
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="text-center text-xl font-semibold mt-4 mb-2">Donor Information</div>
                  <div className="bg-gray-100 rounded-lg mx-0 mb-4 py-3 flex flex-col items-center">
                    <span className="text-sm font-medium">One-time donation</span>
                    <span className="text-2xl font-bold">
                      {currency === 'LKR' ? 'රු' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                      {Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      <span className="text-base font-normal ml-1">{currency}</span>
                    </span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <label className="block font-medium mb-1">First Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block font-medium mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="block font-medium mb-1">Email <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      className="w-full border rounded px-3 py-2"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full border rounded px-3 py-2"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={() => setNewsletter(!newsletter)}
                      className="mr-2"
                      id="newsletter"
                    />
                    <label htmlFor="newsletter" className="text-sm">Sign up for Team Diamonds news and offers?</label>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 mt-2 rounded-lg text-lg font-bold bg-black text-white hover:bg-gray-900"
                  >
                    Next
                  </button>
                </>
              )}
              {step === 4 && (
                <>
                  <div className="text-center text-xl font-semibold mt-4 mb-2">Choose Payment</div>
                  <div className="bg-gray-100 rounded-lg mx-0 mb-4 py-3 flex flex-col items-center">
                    <span className="text-sm font-medium">One-time donation</span>
                    <span className="text-2xl font-bold">
                      {currency === 'LKR' ? 'රු' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                      {Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={coverFees}
                      onChange={() => setCoverFees(!coverFees)}
                      className="mr-2"
                      id="coverFees"
                    />
                    <label htmlFor="coverFees" className="text-sm">Cover transaction fees</label>
                    <span className="ml-2 text-gray-400 cursor-pointer" title="I'd like to cover the fees associated with my donation so more of my donation goes directly to Team Diamonds.">?</span>
                  </div>
                  <div className="mb-4 text-center text-gray-500 text-sm">
                    Transactions are secure and encrypted
                  </div>
                  <button
                    type="button"
                    className="w-full py-3 mb-3 rounded-lg text-lg font-bold bg-black text-white hover:bg-gray-900 flex items-center justify-center"
                    onClick={handleStripePayment}
                    disabled={isProcessing}
                  >
                    Credit Card
                    <span className="ml-2 flex gap-1">
                      <img src="https://img.icons8.com/color/24/000000/visa.png" alt="Visa" />
                      <img src="https://img.icons8.com/color/24/000000/mastercard-logo.png" alt="Mastercard" />
                      <img src="https://img.icons8.com/color/24/000000/amex.png" alt="Amex" />
                    </span>
                  </button>
                  {/* Bank Slip Modal */}
                  {showBankSlipModal && (
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
                      <h3 className="text-lg font-semibold mb-4 text-center">Upload Bank Slip</h3>
                      <form onSubmit={handleBankSlipSubmit}>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={e => setBankSlipFile(e.target.files[0])}
                          className="mb-4"
                          required
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="px-4 py-2 rounded bg-gray-300 text-black"
                            onClick={() => setShowBankSlipModal(false)}
                            disabled={isProcessing}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded bg-black text-white"
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Uploading...' : 'Submit'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-3 mt-2 rounded-lg text-lg font-bold ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-900'}`}
                  >
                    {isProcessing ? 'Processing...' : 'Finish'}
                  </button>
                </>
              )}
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>Powered by GoFundMe</p>
              </div>
              <div className="mt-2 text-center text-xs text-gray-400">
                FAQs <span className="inline-block transform rotate-180">&#8963;</span>
              </div>
            </form>
          </div>
        </div>
        {/* Project selection modal */}
        {showProjectModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-20">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
              <div className="flex items-center mb-4">
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-lg"
                  placeholder="🔍 Search"
                  value={projectSearch}
                  onChange={e => setProjectSearch(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="ml-2 text-blue-600 font-bold text-base"
                  style={{ minWidth: '60px' }}
                >
                  CANCEL
                </button>
              </div>
              <hr className="mb-4"/>
              <div>
                {filteredProjects.map((project) => (
                  <div
                    key={project}
                    className={`py-3 px-2 text-lg cursor-pointer rounded ${supportProject === project ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                    onClick={() => {
                      setSupportProject(project);
                      setShowProjectModal(false);
                    }}
                  >
                    {project}
                  </div>
                ))}
                {filteredProjects.length === 0 && (
                  <div className="py-3 text-gray-400 text-center">No projects found</div>
                )}
              </div>
              <div className="mt-8 text-center text-xs text-gray-400">
                FAQs <span className="inline-block transform rotate-180">&#8963;</span>
              </div>
              <div className="mt-2 text-center text-xs text-gray-500">
                Powered by GoFundMe
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationPage;


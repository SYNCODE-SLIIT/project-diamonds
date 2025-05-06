import React, { useState } from 'react';
import BankSlipPaymentForm from './BankSlipPaymentForm';
import PaymentGatewayForm from './PaymentGatewayForm';
import StripePaymentForm from './StripePaymentForm';

const PaymentOptions = () => {
  const showPaymentGateway = true; // Set to false to hide Payment Gateway option
  const showStripe = true; // Set to false to hide Stripe option
  
  const [selectedMethod, setSelectedMethod] = useState('bankslip');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
          <h2 className="text-3xl font-extrabold text-white text-center">Select Payment Method</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="paymentOption"
                value="bankslip"
                checked={selectedMethod === 'bankslip'}
                onChange={() => setSelectedMethod('bankslip')}
                className="hidden peer"
                id="bankslip"
              />
              <span className="px-4 py-2 rounded-full border-2 border-gray-300 
                peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-checked:text-white 
                transition-all duration-300 ease-in-out">
                Bank Slip
              </span>
            </label>

            {showPaymentGateway && (
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentOption"
                  value="payment_gateway"
                  checked={selectedMethod === 'payment_gateway'}
                  onChange={() => setSelectedMethod('payment_gateway')}
                  className="hidden peer"
                  id="payment_gateway"
                />
                <span className="px-4 py-2 rounded-full border-2 border-gray-300 
                  peer-checked:border-purple-500 peer-checked:bg-purple-500 peer-checked:text-white 
                  transition-all duration-300 ease-in-out">
                  Payment Gateway
                </span>
              </label>
            )}

            {showStripe && (
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentOption"
                  value="stripe"
                  checked={selectedMethod === 'stripe'}
                  onChange={() => setSelectedMethod('stripe')}
                  className="hidden peer"
                  id="stripe"
                />
                <span className="px-4 py-2 rounded-full border-2 border-gray-300 
                  peer-checked:border-green-500 peer-checked:bg-green-500 peer-checked:text-white 
                  transition-all duration-300 ease-in-out">
                  Stripe
                </span>
              </label>
            )}
          </div>

          <div className="mt-4">
            {selectedMethod === 'bankslip' && <BankSlipPaymentForm />}
            {selectedMethod === 'payment_gateway' && showPaymentGateway && <PaymentGatewayForm />}
            {selectedMethod === 'stripe' && showStripe && <StripePaymentForm amount={1000} onClose={() => setSelectedMethod('bankslip')} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;
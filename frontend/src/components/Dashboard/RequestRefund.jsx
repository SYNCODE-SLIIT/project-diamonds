import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import RecentTransaction from './RecentTransaction';
import RefundForm from './RefundForm';

const RequestRefund = () => {
  const [transactions, setTransactions] = useState([]);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Helper function to fetch transactions (i.e. payments)
  const fetchTransactions = () => {
    axiosInstance.get('http://localhost:4000/api/finance/getp')
      .then((response) => {
        setTransactions(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
      });
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRequestRefund = (payment) => {
    // Open the refund modal with the selected payment details.
    setSelectedPayment(payment);
    setIsRefundModalOpen(true);
  };

  const closeRefundModal = () => {
    setIsRefundModalOpen(false);
    setSelectedPayment(null);
    // Refresh transactions to update refund status (if a refund has been requested).
    fetchTransactions();
  };

  const handleSeeMore = () => {
    // Navigate to a detailed transactions view.
  };

  return (
    <div>
      <RecentTransaction 
        transactions={transactions} 
        onSeeMore={handleSeeMore} 
        onRequestRefund={handleRequestRefund} 
      />
      {isRefundModalOpen && selectedPayment && (
        <RefundForm 
          onClose={closeRefundModal} 
          paymentId={selectedPayment._id} 
          prefillInvoiceNumber={selectedPayment.invoiceNumber} 
        />
      )}
    </div>
  );
};

export default RequestRefund;
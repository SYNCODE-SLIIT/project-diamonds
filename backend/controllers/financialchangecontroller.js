// Inline Status Update Handlers
const handleInvoiceStatusChange = (e, invoice) => {
    const newStatus = e.target.value;
    if (newStatus === invoice.paymentStatus) return;
    axios
      .patch(`http://localhost:4000/api/finance/i/${invoice._id}`, { paymentStatus: newStatus })
      .then(() => {
        toast.success(`Invoice ${invoice.invoiceNumber} updated to ${newStatus}`);
        const updatedInvoices = dashboardData.invoices.map((item) =>
          item._id === invoice._id ? { ...item, paymentStatus: newStatus } : item
        );
        setDashboardData({ ...dashboardData, invoices: updatedInvoices });
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to update invoice status');
      });
  };

  const handlePaymentStatusChange = (e, payment) => {
    const newStatus = e.target.value;
    if (newStatus === payment.status) return;
  
    axios
      .patch(`http://localhost:4000/api/finance/p/${payment._id}`, { status: newStatus })
      .then(() => {
        toast.success(`Payment updated to ${newStatus}`);
        // Update the payments list
        const updatedPayments = dashboardData.payments.map((item) =>
          item._id === payment._id ? { ...item, status: newStatus } : item
        );
  
        // Update expenses locally: add only if approved, remove if not.
        let updatedExpenses = dashboardData.expenses || [];
        if (newStatus === 'approved') {
          if (!updatedExpenses.find((exp) => exp._id === payment._id)) {
            updatedExpenses.push({ ...payment, status: newStatus });
          }
        } else {
          updatedExpenses = updatedExpenses.filter((exp) => exp._id !== payment._id);
        }
  
        setDashboardData({
          ...dashboardData,
          payments: updatedPayments,
          expenses: updatedExpenses,
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to update payment status');
      });
  };

  const handleRefundStatusChange = (e, refund) => {
    const newStatus = e.target.value;
    if (newStatus === refund.status) return;
    axios
      .patch(`http://localhost:4000/api/finance/r/${refund._id}`, { status: newStatus })
      .then(() => {
        toast.success(`Refund updated to ${newStatus}`);
        const updatedRefunds = dashboardData.refunds.map((item) =>
          item._id === refund._id ? { ...item, status: newStatus } : item
        );
        setDashboardData({ ...dashboardData, refunds: updatedRefunds });
      })
      .catch((error) => {
        console.error(error);
        toast.error('Failed to update refund status');
      });
  };

  const handleBudgetStatusChange = async (e, budget) => {
    const newStatus = e.target.value;
    if (newStatus === budget.status) return;
    try {
      await axios.patch(`http://localhost:4000/api/finance/b/${budget._id}`, {
        allocatedBudget: budget.allocatedBudget,
        currentSpend: budget.currentSpend,
        status: newStatus,
      });
      toast.success(`Budget status updated to "${newStatus}"`);
      const updatedBudget = { ...dashboardData.budget, status: newStatus };
      setDashboardData({ ...dashboardData, budget: updatedBudget });
    } catch (error) {
      console.error('Error updating budget status:', error);
      toast.error('Failed to update budget status');
    }
  };
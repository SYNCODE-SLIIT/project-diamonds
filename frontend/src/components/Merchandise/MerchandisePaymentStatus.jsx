  try {
    const res = await axiosInstance.get(`/api/finance/payment-status/${orderId}`);
    setPaymentStatus(res.data.status);
  } catch {
    setPaymentStatus('Error fetching status');
  } finally {
    setStatusLoading(false);
  } 
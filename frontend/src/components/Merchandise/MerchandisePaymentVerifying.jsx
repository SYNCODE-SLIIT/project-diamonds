  try {
    const res = await axiosInstance.get(`/api/finance/payment/${orderId}`);
    setPaymentDetails(res.data);
  } catch {
    setError('Failed to fetch payment details');
  } finally {
    setLoading(false);
  } 
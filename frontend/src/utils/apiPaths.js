// utils/apiPaths.js

export const BASE_URL = "http://localhost:4000";

export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    GET_USER_INFO: "/api/auth/getUser",
    UPDATE_PASSWORD: "/api/users/password",
  },
  DASHBOARD: {
    GET_DATA: "/api/v1/dashboard",
  },
  INCOME: {
    ADD_INCOME: "/api/v1/income/add",
    GET_ALL_INCOME: "/api/v1/income/get",
    DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DOWNLOAD_INCOME: `/api/v1/income/downloadexcel`,
  },
  EXPENSE: {
    ADD_EXPENSE: "/api/v1/expense/add",
    GET_ALL_EXPENSE: "/api/v1/expense/get",
    DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DOWNLOAD_EXPENSE: `/api/v1/expense/downloadexcel`,
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
  TRANSACTION: {
    DOWNLOAD_ALL: "/api/v1/transaction/downloadall",
  },
  REFUND: {
    GET_ALL_REFUNDS: "/api/finance/getr",
    ADD_REFUND: "/api/finance/ef",
    UPDATE_REFUND: (refundId) => `/api/v1/refund/${refundId}`,
  },
  FINANCE: {
    GET_ALL_PAYMENTS: "/api/finance/getp",
    GET_PAYMENT_BY_ID: (paymentId) => `/api/finance/getp/${paymentId}`,
  },
};

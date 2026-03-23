import { api } from "../api/apiClient";

const paymentApi = {
  processPayment: async (payload) =>
    (await api.post(`/payment/processpayment`, payload)).data,
};

export default paymentApi;

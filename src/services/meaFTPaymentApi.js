import { api } from "../api/apiClient";

const meaFTPaymentApi = {
  processPayment: async (payload) =>
    (await api.post("/MeaFTPayment/processpayment", payload)).data,
};

export default meaFTPaymentApi;
import { api, unwrap } from "../api/apiClient";

const BASE = "/MeaFTOnlineOrders";

const meaFtOnlineOrdersApi = {
  getOpenOrders: async () => unwrap((await api.get(`${BASE}/open`)).data),
  getById: async (id) => unwrap((await api.get(`${BASE}/${id}`)).data),
  create: async (payload) => unwrap((await api.post(BASE, payload)).data),
  update: async (id, payload) => unwrap((await api.put(`${BASE}/${id}`, payload)).data),
};

export default meaFtOnlineOrdersApi;

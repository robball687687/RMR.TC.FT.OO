import { api } from "../api/apiClient";

const BASE = "/TCVariable";

const tcVariableApi = {
  getValue: async (name) => (await api.get(`${BASE}/value/${encodeURIComponent(name)}`, {
    params: { name },
  })).data,
};

export default tcVariableApi;

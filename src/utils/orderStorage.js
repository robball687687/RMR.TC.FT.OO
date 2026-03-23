export const saveLastOrder = (order) => {
  try {
    localStorage.setItem("tc_last_order", JSON.stringify(order));
  } catch {}
};

export const getLastOrder = () => {
  try {
    const raw = localStorage.getItem("tc_last_order");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const clearLastOrder = () => {
  try { localStorage.removeItem("tc_last_order"); } catch {}
};
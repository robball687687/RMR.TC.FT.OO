import { useEffect, useState } from "react";
import { getLastOrder, clearLastOrder } from "../utils/orderStorage";

const TTL = 1000 * 60 * 60 * 6; // 6 hours
const KEY = "tc_last_order_banner_seen_at";

function hasSeen() {
  try {
    const t = sessionStorage.getItem(KEY);
    return t && (Date.now() - Number(t)) < TTL;
  } catch { return false; }
}
function markSeen() {
  try { sessionStorage.setItem(KEY, String(Date.now())); } catch {}
}

export default function useLastOrderBanner(navigate) {
  const [lastOrderId, setLastOrderId] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const last = getLastOrder();
    if (last?.orderId) {
      setLastOrderId(String(last.orderId));
      if (!hasSeen()) setOpen(true);
    }
  }, []);

  const dismiss = () => {
    markSeen();
    setOpen(false);
  };

  const view = (id) => {
    markSeen();
    navigate(`/order-success/${id}`);
  };

  return {
    lastOrderId,
    bannerOpen: open,
    dismissBanner: dismiss,
    viewLastOrder: view,
    clearLastOrder, // exposed if you want to clear on dismiss
  };
}

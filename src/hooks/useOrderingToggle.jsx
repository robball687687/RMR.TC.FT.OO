import { useEffect, useState } from "react";
import tcVariableApi from "../services/tcVariableApi";

const ORDERING_TOGGLE_NAME = "Mea-Online-Ordering-Website-On-Off";

export default function useOrderingToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    let alive = true;

    tcVariableApi
      .getValue(ORDERING_TOGGLE_NAME)
      .then((value) => {
        if (!alive) return;
        const rawValue = value?.toString().trim().toLowerCase();
        const isOff = rawValue === "off" || rawValue === "0" || rawValue === "false";
        setEnabled(!isOff);
      })
      .catch(() => {
        if (alive) setEnabled(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  return enabled;
}

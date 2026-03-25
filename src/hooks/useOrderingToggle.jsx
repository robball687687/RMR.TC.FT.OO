import { useEffect, useState } from "react";
import tcVariableApi from "../services/tcVariableApi";

const ORDERING_TOGGLE_NAME = "Mea-FT-Online-Ordering-Website-On-Off";

export default function useOrderingToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let alive = true;

    tcVariableApi
      .getValue(ORDERING_TOGGLE_NAME)
      .then((value) => {
        if (!alive) return;

        const rawValue = value?.toString().trim().toLowerCase();
        const isOn =
          rawValue === "on" ||
          rawValue === "1" ||
          rawValue === "true" ||
          rawValue === "yes";

        setEnabled(isOn);
      })
      .catch((err) => {
        console.error("Error loading ordering toggle:", err);
        if (alive) setEnabled(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  return enabled;
}
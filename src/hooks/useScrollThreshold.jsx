import { useEffect, useState } from "react";
export default function useScrollThreshold(px = 300) {
  const [hit, setHit] = useState(false);
  useEffect(() => {
    const onScroll = () => setHit(window.scrollY > px);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [px]);
  return hit;
}

import { useEffect, useState } from "react";
import meaFtMenuApi from "../services/meaFtMenuApi";

export default function useMenuData() {
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const loadMenu = async () => {
      try {
        setLoading(true);
        const categories = await meaFtMenuApi.getWebMenu(true);
        if (alive) {
          setMenuCategories(Array.isArray(categories) ? categories : []);
        }
      } catch (err) {
        console.error("Error fetching food truck menu:", err);
        if (alive) {
          setMenuCategories([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadMenu();

    return () => {
      alive = false;
    };
  }, []);

  return { menuCategories, loading };
}
import { api, unwrap } from "../api/apiClient";

const BASE = "/MeaFTMenu";

const mapFoodTruckMenu = (data) => {
  const categories = data?.categories || data?.Categories || [];

  return categories.map((category) => ({
    meaFTMenuCategoryId: category.meaFTMenuCategoryId,
    categoryName: category.categoryName,
    displayOrder: category.displayOrder,
    menuItems: (category.items || []).map((menuItem) => ({
      item: {
        menuItemId: menuItem.meaFTMenuItemId,
        itemName: menuItem.itemName,
        itemDesc: menuItem.description?.descriptionText || "",
        itemPrice: menuItem.basePrice,
        itemImage: menuItem.images?.[0]?.imageUrl || "",
        active: menuItem.active,
      },
      options: menuItem.options || [],
      raw: menuItem,
    })),
  }));
};

const meaFtMenuApi = {
  getFullMenu: async (activeOnly = true) => {
    const data = (await api.get(BASE, { params: { activeOnly } })).data;
    return unwrap(data);
  },

  getWebMenu: async (activeOnly = true) => {
    const data = (await api.get(BASE, { params: { activeOnly } })).data;
    return mapFoodTruckMenu(data);
  },

  getById: async (id) =>
    unwrap((await api.get(`${BASE}/${id}`)).data),

  create: async (payload) =>
    unwrap((await api.post(BASE, payload)).data),

  update: async (id, payload) =>
    unwrap((await api.put(`${BASE}/${id}`, payload)).data),

  remove: async (id) =>
    unwrap((await api.delete(`${BASE}/${id}`)).data),
};

export default meaFtMenuApi;
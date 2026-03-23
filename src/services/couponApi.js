import { api } from "../api/apiClient";

const couponApi = {
  checkCoupon: async (coupon) =>
    (await api.post(`/Coupon/CouponCheck`, null, { params: { coupon } })).data,
};

export default couponApi;

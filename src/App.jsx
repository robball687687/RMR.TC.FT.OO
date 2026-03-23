import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CheckoutPage from "./pages/CheckoutPage";
import Header from "./components/Header";
import CartProvider from "./store/CartContext";
import ReviewOrderPage from "./pages/ReviewOrderPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import SiteFooter from "./components/SiteFooter";

function AppInner() {
  const { pathname } = useLocation();
  const hideFooter =
    pathname.startsWith("/checkout") || pathname.startsWith("/review");

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/review" element={<ReviewOrderPage />} />
        <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
      </Routes>
      {!hideFooter && <SiteFooter />}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <AppInner />
      </Router>
    </CartProvider>
  );
}

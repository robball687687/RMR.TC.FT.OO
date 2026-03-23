// src/pages/MenuPage.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Snackbar,
  Skeleton,
  InputAdornment,
  TextField,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import CategoryTabs from "../components/menu/CategoryTabs";
import MenuCard from "../components/menu/MenuCard";
import OptionsDialog from "../components/menu/OptionsDialog";
import FloatingCartButton from "../components/common/FloatingCartButton";
import LastOrderSnackbar from "../components/common/LastOrderSnackbar";
import useOrderingToggle from "../hooks/useOrderingToggle";
import useMenuData from "../hooks/useMenuData";
import useScrollThreshold from "../hooks/useScrollThreshold";
import useLastOrderBanner from "../hooks/useLastOrderBanner";
import ThaiPaperBackground from "../components/common/ThaiPaperBackground";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function MenuPage() {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const isOrderingEnabled = useOrderingToggle();
  const { menuCategories, loading } = useMenuData();
  const showCartButton = useScrollThreshold(300);

  const [activeCategory, setActiveCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("Added to cart!");
  const [snackSeverity, setSnackSeverity] = useState("success");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { lastOrderId, bannerOpen, dismissBanner, viewLastOrder } =
    useLastOrderBanner(navigate);

  const isActive = (m) => {
    const i = m?.item || {};
    return (
      i.active === true ||
      i.active === 1 ||
      String(i.active).toLowerCase() === "true"
    );
  };

  const filteredItems = useMemo(() => {
    const items = menuCategories?.[activeCategory]?.menuItems || [];
    return items.filter(
      ({ item }) =>
        (item.itemName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.itemDesc || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menuCategories, activeCategory, searchTerm]);

  const openSnack = (message, severity = "success") => {
    setSnackMsg(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const addMenuItemToCart = (menuItem, qty = 1, overridePrice = null) => {
    const i = menuItem.item;
    const priceToUse =
      overridePrice != null ? overridePrice : Number(i.itemPrice || 0);

    if (priceToUse > 0) {
      addToCart({
        id: i.menuItemId,
        name: i.itemName,
        description: i.itemDesc,
        price: priceToUse,
        image: i.itemImage,
        qty,
      });
    }
  };

  const handleAddToCartClick = (menuItem, qty = 1) => {
    if (!isActive(menuItem)) return;

    if (menuItem.options?.length) {
      setSelectedItem({ ...menuItem, _qty: qty });
      setPickerOpen(true);
      return;
    }

    addMenuItemToCart(menuItem, qty);
    openSnack("Added to cart!", "success");
  };

  const handleOptionsConfirm = ({ selections, finalPrice, quantity }) => {
    const i = selectedItem.item;

    addToCart({
      id: i.menuItemId,
      name: i.itemName,
      description: i.itemDesc,
      price: finalPrice,
      image: i.itemImage,
      qty: quantity ?? selectedItem._qty ?? 1,
      options: selections,
    });

    setPickerOpen(false);
    setSelectedItem(null);
    openSnack("Added to cart!", "success");
  };

  return (
    <ThaiPaperBackground>
      <Box sx={{ px: 2, py: { xs: 2, md: 3 } }}>
        {/* TITLE */}
        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: 700, letterSpacing: 0.3, mb: 1 }}
        >
          Menu
        </Typography>

        {/* 🔥 NEW BANNER */}
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            mx: "auto",
            maxWidth: 720,
            p: 1.5,
            textAlign: "center",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "warning.light",
            bgcolor: "rgba(255, 244, 229, 0.95)",
          }}
        >
          <Typography sx={{ fontWeight: 800, color: "warning.dark" }}>
            Food Trailer Online Ordering Only
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This menu is for <strong>pickup at our food trailer location only</strong> and is{" "}
            <strong>not for our dine-in restaurant</strong>.
          </Typography>
        </Paper>

        {!isOrderingEnabled ? (
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              border: "1px solid",
              borderColor: "divider",
              backdropFilter: "blur(6px)",
              bgcolor: "rgba(255,255,255,0.76)",
            }}
          >
            <Typography variant="h6" sx={{ color: "error.main" }}>
              We are currently closed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Online ordering is not available right now.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* CATEGORY + SEARCH */}
            <Paper
              elevation={0}
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                backdropFilter: "blur(10px)",
                bgcolor: "rgba(255,255,255,0.85)",
                border: "1px solid",
                borderColor: "rgba(0,0,0,0.06)",
                borderRadius: 2,
                p: 1.5,
                mb: 2,
              }}
            >
              <CategoryTabs
                categories={menuCategories}
                value={activeCategory}
                onChange={(_, v) => setActiveCategory(v)}
              />

              <Box mt={1.5}>
                <TextField
                  placeholder="Search dishes…"
                  fullWidth
                  size="medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      backgroundColor: "background.paper",
                    },
                  }}
                />
              </Box>
            </Paper>

            {/* MENU GRID */}
            {loading ? (
              <Grid container spacing={2}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid key={i} item xs={12} sm={6}>
                    <Paper sx={{ p: 1.5, borderRadius: 3 }}>
                      <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
                      <Skeleton sx={{ mt: 1 }} width="60%" />
                      <Skeleton width="90%" />
                      <Skeleton width="40%" />
                      <Skeleton variant="rectangular" height={36} sx={{ mt: 1, borderRadius: 2 }} />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : filteredItems.length > 0 ? (
              <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }}>
                {filteredItems.map((menuItem) => {
                  const i = menuItem.item;
                  const outOfStock = !isActive(menuItem);

                  return (
                    <Grid item xs={12} sm={6} md={3} key={i.menuItemId}>
                      <MenuCard
                        item={i}
                        hasOptions={!!menuItem.options?.length}
                        onAdd={(payload) =>
                          handleAddToCartClick(menuItem, payload?.qty ?? 1)
                        }
                        outOfStock={outOfStock}
                        disabledReason={outOfStock ? "Currently unavailable" : ""}
                        disabledLabel={outOfStock ? "Out of stock" : ""}
                        disabledButtonText={outOfStock ? "Out" : ""}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
                <Typography variant="h6">No items found</Typography>
              </Paper>
            )}
          </>
        )}

        {/* SNACKBAR */}
        <Snackbar
          open={snackOpen}
          autoHideDuration={3200}
          onClose={() => setSnackOpen(false)}
        >
          <Alert severity={snackSeverity}>{snackMsg}</Alert>
        </Snackbar>

        {/* OPTIONS */}
        <OptionsDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          menuItem={selectedItem}
          onConfirm={handleOptionsConfirm}
        />

        <LastOrderSnackbar
          open={bannerOpen}
          lastOrderId={lastOrderId}
          onView={viewLastOrder}
          onDismiss={dismissBanner}
        />

        {/* FLOATING CART */}
        {isOrderingEnabled && showCartButton && cartItems.length > 0 && (
          <FloatingCartButton
            onClick={() => navigate("/checkout")}
            count={cartItems.reduce((sum, i) => sum + (i.qty || 1), 0)}
            icon={<ShoppingCartIcon sx={{ mr: 1 }} />}
          />
        )}
      </Box>
    </ThaiPaperBackground>
  );
}
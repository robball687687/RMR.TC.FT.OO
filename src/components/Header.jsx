import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../store/CartContext";
import { getLastOrder, clearLastOrder } from "../utils/orderStorage";

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const cartTotal = cartItems
    .reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1), 0)
    .toFixed(2);

  const getSelectedOptionLines = (opts) => {
    if (!opts) return [];

    return Object.values(opts)
      .flatMap((val) => (Array.isArray(val) ? val : [val]))
      .filter(Boolean)
      .map((v) => ({
        label: v.displayName || v.valueName || "",
        price: Number(v.priceAdjustment || 0),
      }));
  };

  useEffect(() => {
    const lo = getLastOrder();
    if (lo) setLastOrder(lo);
  }, []);

  return (
    <>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "rgba(0,0,0,0.06)",
          backgroundColor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
          <IconButton
            edge="start"
            color="inherit"
            sx={{
              display: { xs: "inline-flex", md: "none" },
              mr: 1,
              color: "text.primary",
            }}
            aria-label="menu"
            component={Link}
            to="/menu"
          >
            <MenuIcon />
          </IconButton>

          <Box
            component={Link}
            to="/"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
              mr: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, letterSpacing: 0.3, color: "text.primary" }}
            >
              The Mea Thai
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Box sx={{ display: { xs: "none", sm: "block" }, mr: 1 }}>
            <Button component={Link} to="/menu" size="small" sx={{ fontWeight: 700 }}>
              Menu
            </Button>
          </Box>

          <IconButton
            color="primary"
            onClick={toggleDrawer}
            aria-label="Open cart"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
              borderRadius: 2,
              px: 1,
              height: 40,
            }}
          >
            <Badge
              badgeContent={cartItems.reduce((sum, item) => sum + (item.qty || 1), 0)}
              color="error"
            >
              <ShoppingCartIcon />
            </Badge>

            {!isMobile && (
              <Typography variant="body2" sx={{ ml: 1, fontWeight: 800 }}>
                ${cartTotal}
              </Typography>
            )}
          </IconButton>
        </Toolbar>

        {lastOrder && (
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 0.75,
              background:
                "linear-gradient(90deg, rgba(16,185,129,.95), rgba(16,185,129,.85))",
              color: "#fff",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Last order #{lastOrder.orderId || ""} placed successfully
              </Typography>

              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  sx={{ color: "#fff", textTransform: "none" }}
                  onClick={() => navigate(`/order-success/${lastOrder.orderId || ""}`)}
                >
                  View
                </Button>
                <Button
                  size="small"
                  sx={{ color: "#fff", textTransform: "none" }}
                  onClick={() => {
                    clearLastOrder();
                    setLastOrder(null);
                  }}
                >
                  Dismiss
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box width={300} role="presentation" p={2}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
            Your Cart
          </Typography>

          <List>
            {cartItems.length === 0 ? (
              <ListItem>
                <ListItemText primary="Cart is empty." />
              </ListItem>
            ) : (
              cartItems.map((item, index) => (
                <ListItem
                  key={`${item.id}-${index}`}
                  alignItems="flex-start"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    px: 0,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    width="100%"
                    alignItems="center"
                    gap={1}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight="bold" noWrap title={item.name}>
                        {item.name} x{item.qty}
                      </Typography>

                      {(() => {
                        const lines = getSelectedOptionLines(item.options);
                        return lines.length ? (
                          <Box sx={{ mt: 0.5 }}>
                            {lines.map((l, idx) => (
                              <Typography
                                key={idx}
                                variant="body2"
                                color="text.secondary"
                                sx={{ display: "block" }}
                              >
                                • {l.label}
                                {l.price > 0 ? ` (+$${l.price.toFixed(2)})` : ""}
                              </Typography>
                            ))}
                          </Box>
                        ) : null;
                      })()}
                    </Box>

                    <Box display="flex" alignItems="center">
                      <Button
                        size="small"
                        onClick={() => removeFromCart(item)}
                        sx={{ minWidth: 0, px: 1 }}
                      >
                        −
                      </Button>
                      <Typography px={1}>{item.qty}</Typography>
                      <Button
                        size="small"
                        onClick={() => addToCart({ ...item, qty: 1 })}
                        sx={{ minWidth: 0, px: 1 }}
                      >
                        +
                      </Button>
                    </Box>
                  </Box>
                </ListItem>
              ))
            )}
          </List>

          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 800 }}>
            Total: ${cartTotal}
          </Typography>

          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => clearCart()}
          >
            Clear Cart
          </Button>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => {
              toggleDrawer();
              navigate("/checkout");
            }}
          >
            Go to Checkout
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
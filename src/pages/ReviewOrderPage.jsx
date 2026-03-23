import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import { useCart } from "../store/CartContext";

const formatSelectedOptions = (opts) => {
  if (!opts) return "";

  return Object.values(opts)
    .flatMap((val) => (Array.isArray(val) ? val : [val]))
    .filter(Boolean)
    .map((v) => {
      const label = v.displayName || v.valueName || "";
      const price = Number(v.priceAdjustment || 0);
      return `${label}${price > 0 ? ` (+$${price.toFixed(2)})` : ""}`;
    })
    .join(", ");
};

export default function ReviewOrderPage() {
  const { cartItems, clearCart } = useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );
  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    alert("Order placed!");
    clearCart();
    window.location.href = "/";
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Review Your Order
      </Typography>

      <List>
        {cartItems.map((item, index) => (
          <Box key={index}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={`${item.name} x${item.qty || 1}`}
                secondary={item.options ? formatSelectedOptions(item.options) : null}
              />
              <Typography variant="body1">
                ${(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
              </Typography>
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>

      <Box mt={2}>
        <Typography>Subtotal: ${subtotal.toFixed(2)}</Typography>
        <Typography>Tax: ${tax.toFixed(2)}</Typography>
        <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
        onClick={handlePlaceOrder}
      >
        Place Order
      </Button>
    </Box>
  );
}
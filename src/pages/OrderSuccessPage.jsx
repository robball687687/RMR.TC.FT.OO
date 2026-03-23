// OrderSuccessPage.jsx
import React from "react";
import { Box, Typography, Button, Divider, List, ListItem, ListItemText, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getLastOrder, clearLastOrder } from "../utils/orderStorage";
import LLLFeedback from "../components/LLLFeedback";

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const lastOrder = getLastOrder();

  if (!lastOrder) {
    return (
      <Box p={2}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No recent order found. If you just placed one, it may have expired or been cleared.
        </Alert>
        <Button variant="contained" onClick={() => navigate("/menu")}>Back to Menu</Button>
      </Box>
    );
  }

  const { totals, items, name, phone, email, placedAt } = lastOrder;

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Thank you! 🎉</Typography>
      <Typography sx={{ mb: 1 }}>Your order has been placed successfully.</Typography>
      <Typography variant="subtitle1" fontWeight="bold">Order #{orderId}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Placed at: {new Date(placedAt).toLocaleString()}
      </Typography>

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Summary</Typography>
      <List dense>
        {(items || []).map((it, idx) => (
          <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
            <ListItemText
              primary={`${it.qty} × ${it.name}`}
              secondary={
                it?.options
                  ? Object.entries(it.options)
                      .map(([k, v]) => (Array.isArray(v) ? v.join(", ") : String(v)))
                      .join(" • ")
                  : null
              }
            />
            <Typography>${(it.price * (it.qty || 1)).toFixed(2)}</Typography>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />
      <Typography>Subtotal: ${totals.subtotal}</Typography>
      <Typography>Discount: -${totals.discount}</Typography>
      <Typography>Tax: ${totals.tax}</Typography>
      <Typography>Tip: ${totals.tip}</Typography>
      <Typography variant="h6" sx={{ mt: 1 }}>Total: ${totals.total}</Typography>

      <Divider sx={{ my: 2 }} />
      <Typography variant="h6">Contact</Typography>
      <Typography>{name}</Typography>
      <Typography variant="body2" color="text.secondary">{phone} • {email}</Typography>

      <Box mt={3} display="flex" gap={1}>
        <Button variant="outlined" onClick={() => navigate("/menu")}>Back to Menu</Button>
        <Button
          variant="text"
          onClick={() => {
            clearLastOrder();
            navigate("/menu");
          }}
        >
          Dismiss & Clear
        </Button>
      </Box>

      
    </Box>
  );
}

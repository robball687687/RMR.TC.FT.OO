// ✅ WHAT YOU’LL GET
// - Clicking “Mea Bargain Bag” opens a modal showing the rules
// - "I Accept" => adds the bag to cart (ONLY then)
// - "It’s not for me" => closes modal and does NOT add
// - If user already has the bag in cart and opens modal again, “It’s not for me” can remove it (optional)
// - Also blocks adding other items when bag is in cart (your existing logic)

//
// 1) Add this NEW component file:
//
// src/components/menu/BargainBagRulesDialog.jsx
//
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  Box,
} from "@mui/material";

export default function BargainBagRulesDialog({
  open,
  onAccept,
  onDecline,
  pickupWindowText,
}) {
  return (
    <Dialog open={open} onClose={onDecline} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>
        🥡 Mea Bargain Bag Rules (Thai Wife Approved 😅)
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 1 }}>
          This is a fun way to try new items we’re testing (and end-of-night
          goodies). Picky eaters need not apply 🙃
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <li>
            <Typography variant="body2">
              <b>Separate order only:</b> no other menu items can be added with a
              Mea Bargain Bag.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <b>Pickup window:</b> {pickupWindowText} (Eastern).
            </Typography>
          </li>          
          <li>
            <Typography variant="body2">
              <b>No substitutions.</b> Your bag may include new menu experiments,
              fresh rolls at the end of the night, or anything else the Thai Wife
              is feeling.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <b>No refunds.</b> If you don’t pick up your order, refunds will not
              be given.
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <b>No refunds if you don’t like the food.</b> We’ll try to improve
              next time — but you’re paying for the <i>attempt</i> of the bag.
              This is a chance of <b>Thai luck</b> ✨🇹🇭
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              By purchasing a Mea Bargain Bag, you agree to all rules of the bag.
              🙏
            </Typography>
          </li>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Pro tip: best way to discover a new favorite without thinking too hard — let the Thai Wife choose 😄
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onDecline} variant="outlined">
          It’s not for me
        </Button>
        <Button onClick={onAccept} variant="contained" sx={{ fontWeight: 900 }}>
          I Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
}

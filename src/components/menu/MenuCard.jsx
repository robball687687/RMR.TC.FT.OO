// components/menu/MenuCard.jsx
import React, { useState } from "react";
import {
  Card,
  CardActionArea,
  Typography,
  Box,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const FALLBACK_IMG =
  "https://rmrstorage.blob.core.windows.net/measite/MeaLogoBlackTrans.png";

export default function MenuCard({
  item,
  hasOptions,
  selectedQty,
  onQtyChange,
  onAdd,
  outOfStock = false,

  // NEW (optional)
  disabledReason = "", // e.g. "Separate order" or "Available until 7:30 PM"
  disabledLabel = "",  // ribbon text; defaults to "Out of stock"
  disabledButtonText = "", // button text; defaults to "Out"

  fixedWidth = 350,
  fixedHeight = 340,
}) {
  const price = Number(item.itemPrice || 0);
  const fullDesc = item.itemDesc || "";
  const MAX_LEN = 110;

  const isLong = fullDesc.length > MAX_LEN;
  const shortDesc = isLong
    ? fullDesc.slice(0, MAX_LEN).trimEnd() + "..."
    : fullDesc;

  const [descOpen, setDescOpen] = useState(false);

  const handleCardClick = () => {
    if (!outOfStock) onAdd?.();
  };

  const handleViewFullClick = (e) => {
    e.stopPropagation();
    setDescOpen(true);
  };

  const handleDialogClose = () => setDescOpen(false);

  const ribbonText = outOfStock ? (disabledLabel || "Out of stock") : "";
  const btnText = outOfStock ? (disabledButtonText || "Out") : "Add";

  return (
    <>
      <Card
        elevation={2}
        sx={{
          width: fixedWidth,
          height: fixedHeight,
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 8px 24px rgba(0,0,0,.08)",
          "&:hover img": { transform: outOfStock ? "none" : "scale(1.04)" },
        }}
      >
        <CardActionArea
          onClick={outOfStock ? undefined : handleCardClick}
          disabled={outOfStock}
          sx={{ width: "100%", height: "100%", position: "relative" }}
        >
          {/* FULL-BLEED IMAGE */}
          <Box
            component="img"
            src={item.itemImage || FALLBACK_IMG}
            alt={item.itemName}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMG;
            }}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform .35s ease, filter .2s ease, opacity .2s ease",
              willChange: "transform",
              filter: outOfStock ? "grayscale(60%) brightness(0.8)" : "none",
              opacity: outOfStock ? 0.85 : 1,
            }}
          />

          {/* PRICE CHIP */}
          {price > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                px: 1.1,
                py: 0.4,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(6px)",
                fontWeight: 800,
                fontSize: 13,
                border: "1px solid rgba(0,0,0,.08)",
                boxShadow: "0 6px 18px rgba(0,0,0,.12)",
                opacity: outOfStock ? 0.7 : 1,
              }}
            >
              ${price.toFixed(2)}
            </Box>
          )}

          {/* DISABLED RIBBON */}
          {outOfStock && (
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: -40,
                px: 6,
                py: 0.5,
                transform: "rotate(-15deg)",
                bgcolor: "rgba(17,17,17,0.85)",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 6px 18px rgba(0,0,0,.2)",
                pointerEvents: "none",
              }}
            >
              {ribbonText}
            </Box>
          )}

          {/* FOOTER OVERLAY */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              px: 1.25,
              py: 1,
              display: "flex",
              flexDirection: "column",
              gap: 0.4,
              bgcolor: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
            }}
          >
            {/* Name + Add button row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ color: "#fff", fontWeight: 800, flex: 1 }}
                title={item.itemName}
              >
                {item.itemName}
              </Typography>

              <Tooltip
                title={
                  outOfStock
                    ? disabledReason || "Currently unavailable"
                    : ""
                }
              >
                <span>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={outOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!outOfStock) onAdd?.();
                    }}
                    sx={{
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 800,
                      py: 0.4,
                      px: 1.4,
                    }}
                  >
                    {btnText}
                  </Button>
                </span>
              </Tooltip>
            </Box>

            {/* Optional disabledReason line (so users *see* why) */}
            {outOfStock && disabledReason && (
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}
              >
                {disabledReason}
              </Typography>
            )}

            {/* Short description + "View full" */}
            {fullDesc && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 0.75,
                  mt: 0.2,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "0.78rem",
                    lineHeight: 1.35,
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {shortDesc}
                </Typography>

                {isLong && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={handleViewFullClick}
                    sx={{
                      color: "rgba(255,255,255,0.9)",
                      textTransform: "none",
                      fontSize: "0.7rem",
                      p: 0,
                      minWidth: "auto",
                    }}
                  >
                    View full
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </CardActionArea>
      </Card>

      {/* FULL DESCRIPTION MODAL */}
      <Dialog open={descOpen} onClose={handleDialogClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          <Typography variant="h6" sx={{ mr: 1 }}>
            {item.itemName}
          </Typography>
          <IconButton onClick={handleDialogClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {item.itemImage && (
            <Box
              component="img"
              src={item.itemImage}
              alt={item.itemName}
              sx={{
                width: "100%",
                borderRadius: 1,
                mb: 2,
                objectFit: "cover",
                maxHeight: 260,
              }}
            />
          )}

          <Typography variant="body1" sx={{ mb: 1.5 }}>
            {fullDesc}
          </Typography>

          {price > 0 && (
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              ${price.toFixed(2)}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          {!outOfStock && (
            <Button
              variant="contained"
              onClick={() => {
                onAdd?.();
                handleDialogClose();
              }}
            >
              Add to cart
            </Button>
          )}
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

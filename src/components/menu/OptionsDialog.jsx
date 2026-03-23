import React, { useMemo, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";

const FALLBACK_IMG =
  "https://rmrstorage.blob.core.windows.net/measite/MeaLogoBlackTrans.png";

export default function OptionsDialog({
  open,
  onClose,
  menuItem,
  defaultQty = 1,
  onConfirm,
}) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [qty, setQty] = useState(defaultQty);

  useEffect(() => {
    setSelectedOptions({});
    setQty(defaultQty || 1);
  }, [menuItem, defaultQty, open]);

  const item = menuItem?.item || {};
  const basePrice = Number(item.itemPrice || 0);

  const handleOptionChange = (option, value, isMulti, checked) => {
    const optionId = option.meaFTMenuItemOptionId;

    setSelectedOptions((prev) => {
      if (!isMulti) {
        return {
          ...prev,
          [optionId]: value,
        };
      }

      const curr = Array.isArray(prev[optionId]) ? prev[optionId] : [];
      const exists = curr.some(
        (v) => v.meaFTMenuItemOptionValueId === value.meaFTMenuItemOptionValueId
      );

      let next = curr;

      if (checked && !exists) {
        next = [...curr, value];
      } else if (!checked) {
        next = curr.filter(
          (v) => v.meaFTMenuItemOptionValueId !== value.meaFTMenuItemOptionValueId
        );
      }

      return {
        ...prev,
        [optionId]: next,
      };
    });
  };

  const finalPrice = useMemo(() => {
    if (!menuItem?.item) return 0;

    let total = Number(menuItem.item.itemPrice || 0);

    (menuItem.options || []).forEach((opt) => {
      const optionId = opt.meaFTMenuItemOptionId;
      const sel = selectedOptions[optionId];

      if (Array.isArray(sel)) {
        sel.forEach((v) => {
          total += Number(v.priceAdjustment || 0);
        });
      } else if (sel) {
        total += Number(sel.priceAdjustment || 0);
      }
    });

    return total * qty;
  }, [menuItem, selectedOptions, qty]);

  const confirm = () => {
    const missing = (menuItem?.options || []).filter((opt) => {
      if (!opt.isRequired) return false;

      const optionId = opt.meaFTMenuItemOptionId;
      const sel = selectedOptions[optionId];

      if (opt.selectionType === "Multiple") {
        return !Array.isArray(sel) || sel.length < (opt.minSelections || 1);
      }

      return !sel;
    });

    if (missing.length) {
      alert(
        `Please select an option for: ${missing[0].displayName || missing[0].optionName}`
      );
      return;
    }

    onConfirm({
      selections: selectedOptions,
      finalPrice,
      quantity: qty,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Choose Options</DialogTitle>

      <DialogContent dividers>
        {menuItem?.item && (
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box
              component="img"
              src={item.itemImage || FALLBACK_IMG}
              alt={item.itemName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMG;
              }}
              sx={{
                width: { xs: "100%", sm: 180 },
                height: { xs: 180, sm: 150 },
                objectFit: "cover",
                borderRadius: 1.5,
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 0.5 }}
                noWrap
                title={item.itemName}
              >
                {item.itemName}
              </Typography>

              {item.itemDesc && (
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: "text.secondary",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                  }}
                >
                  {item.itemDesc}
                </Typography>
              )}

              {basePrice > 0 && (
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, mt: 0.5 }}
                >
                  Base price: ${basePrice.toFixed(2)}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {(menuItem?.options || []).map((opt) => {
          const isMulti =
            String(opt.selectionType || "").toLowerCase() === "multiple";
          const optionId = opt.meaFTMenuItemOptionId;
          const currentValue = selectedOptions[optionId];
          const optionLabel = opt.displayName || opt.optionName;

          return (
            <Box key={optionId} mb={2.5}>
              <FormControl fullWidth>
                <FormLabel sx={{ fontWeight: 700, mb: 0.5 }}>
                  {optionLabel}
                </FormLabel>

                {!isMulti ? (
                  <RadioGroup
                    value={currentValue?.meaFTMenuItemOptionValueId || ""}
                    onChange={(e) => {
                      const chosen = (opt.values || []).find(
                        (v) =>
                          String(v.meaFTMenuItemOptionValueId) ===
                          String(e.target.value)
                      );
                      if (chosen) {
                        handleOptionChange(opt, chosen, false, true);
                      }
                    }}
                  >
                    {(opt.values || []).map((optValue) => (
                      <FormControlLabel
                        key={optValue.meaFTMenuItemOptionValueId}
                        value={optValue.meaFTMenuItemOptionValueId}
                        control={<Radio size="small" />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <Typography variant="body2">
                              {optValue.displayName || optValue.valueName}
                            </Typography>
                            {Number(optValue.priceAdjustment) > 0 && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                +${Number(optValue.priceAdjustment).toFixed(2)}
                              </Typography>
                            )}
                          </Box>
                        }
                        sx={{ m: 0.25 }}
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <FormGroup sx={{ mt: 0.5 }}>
                    {(opt.values || []).map((optValue) => {
                      const checked =
                        Array.isArray(currentValue) &&
                        currentValue.some(
                          (v) =>
                            v.meaFTMenuItemOptionValueId ===
                            optValue.meaFTMenuItemOptionValueId
                        );

                      return (
                        <FormControlLabel
                          key={optValue.meaFTMenuItemOptionValueId}
                          control={
                            <Checkbox
                              size="small"
                              checked={!!checked}
                              onChange={(e) =>
                                handleOptionChange(
                                  opt,
                                  optValue,
                                  true,
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                              }}
                            >
                              <Typography variant="body2">
                                {optValue.displayName || optValue.valueName}
                              </Typography>
                              {Number(optValue.priceAdjustment) > 0 && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  +${Number(optValue.priceAdjustment).toFixed(2)}
                                </Typography>
                              )}
                            </Box>
                          }
                          sx={{ m: 0.25 }}
                        />
                      );
                    })}
                  </FormGroup>
                )}
              </FormControl>
            </Box>
          );
        })}

        <Divider sx={{ my: 2 }} />

        <Box display="flex" gap={1.5} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Quantity</InputLabel>
            <Select
              value={qty}
              label="Quantity"
              onChange={(e) => setQty(Number(e.target.value))}
            >
              {[...Array(10)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ ml: "auto", textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="h6" sx={{ m: 0, fontWeight: 800 }}>
              ${finalPrice.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={confirm}
          sx={{ borderRadius: 999, px: 2.5 }}
        >
          Add to Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
}
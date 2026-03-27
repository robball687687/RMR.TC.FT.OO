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
  Stack,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const FALLBACK_IMG =
  "https://rmrstorage.blob.core.windows.net/measite/MeaLogoBlackTrans.png";

function getMenuItemImages(menuItem) {
  const item = menuItem?.item || {};
  const raw = menuItem?.raw || {};

  const rawImages =
    menuItem?.images ||
    menuItem?.Images ||
    raw?.images ||
    raw?.Images ||
    item?.images ||
    item?.Images ||
    [];

  const normalized = rawImages
    .filter((img) => (img?.active ?? img?.Active ?? true))
    .map((img, index) => ({
      id:
        img.meaFTMenuItemImageId ||
        img.MeaFTMenuItemImageId ||
        `${img.imageUrl || img.ImageUrl || "image"}-${index}`,
      imageUrl: img.imageUrl || img.ImageUrl || "",
      thumbnailUrl: img.thumbnailUrl || img.ThumbnailUrl || "",
      altText: img.altText || img.AltText || item?.itemName || "Menu item",
      displayOrder: img.displayOrder ?? img.DisplayOrder ?? index + 1,
      isPrimary: img.isPrimary ?? img.IsPrimary ?? false,
    }))
    .filter((img) => !!img.imageUrl)
    .sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.displayOrder - b.displayOrder;
    });

  if (normalized.length > 0) return normalized;

  return [
    {
      id: "fallback-primary",
      imageUrl: item.itemImage || FALLBACK_IMG,
      thumbnailUrl: item.itemImage || FALLBACK_IMG,
      altText: item.itemName || "Menu item",
      displayOrder: 1,
      isPrimary: true,
    },
  ];
}

export default function OptionsDialog({
  open,
  onClose,
  menuItem,
  defaultQty = 1,
  onConfirm,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [selectedOptions, setSelectedOptions] = useState({});
  const [qty, setQty] = useState(defaultQty);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  useEffect(() => {
    setSelectedOptions({});
    setQty(defaultQty || 1);
    setActiveImageIndex(0);
    setTouchStartX(null);
    setTouchEndX(null);
  }, [menuItem, defaultQty, open]);

  const item = menuItem?.item || {};
  const basePrice = Number(item.itemPrice || 0);
  const images = useMemo(() => getMenuItemImages(menuItem), [menuItem]);

  const safeImageIndex =
    activeImageIndex >= 0 && activeImageIndex < images.length
      ? activeImageIndex
      : 0;

  const activeImage = images[safeImageIndex] || images[0];

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
      const selectionType = String(opt.selectionType || "").toLowerCase();
      const minSelections = opt.minSelections || 1;

      if (selectionType === "multiple") {
        return !Array.isArray(sel) || sel.length < minSelections;
      }

      return !sel;
    });

    if (missing.length) {
      alert(
        `Please select an option for: ${
          missing[0].displayName || missing[0].optionName
        }`
      );
      return;
    }

    onConfirm({
      selections: selectedOptions,
      finalPrice,
      quantity: qty,
      image: activeImage?.imageUrl || item.itemImage || FALLBACK_IMG,
    });
  };

  const goPrev = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e) => {
    if (images.length <= 1) return;
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    if (images.length <= 1) return;
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (images.length <= 1) return;
    if (touchStartX == null || touchEndX == null) return;

    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 40;

    if (distance > minSwipeDistance) {
      setActiveImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    } else if (distance < -minSwipeDistance) {
      setActiveImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Choose Options</DialogTitle>

      <DialogContent dividers>
        {menuItem?.item && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mb: 2.5,
            }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
              }}
              onTouchStart={images.length > 1 ? onTouchStart : undefined}
              onTouchMove={images.length > 1 ? onTouchMove : undefined}
              onTouchEnd={images.length > 1 ? onTouchEnd : undefined}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: { xs: 260, sm: 340, md: 360 },
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
                  backgroundColor: "#f7f4ef",
                }}
              >
                {/* Background blur layer */}
                <Box
                  component="img"
                  src={activeImage?.imageUrl || FALLBACK_IMG}
                  alt=""
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
                    filter: "blur(18px)",
                    transform: "scale(1.06)",
                    opacity: 0.35,
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 1,
                  }}
                />

                {/* Main image */}
                <Box
                  component="img"
                  src={activeImage?.imageUrl || FALLBACK_IMG}
                  alt={activeImage?.altText || item.itemName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    p: 1,
                    display: "block",
                    transition: "opacity 0.25s ease",
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 2,
                  }}
                />

                {/* Controls layer */}
                {images.length > 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 10,
                      pointerEvents: "none",
                    }}
                  >
                    <IconButton
                      onClick={goPrev}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: 10,
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(4px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        zIndex: 11,
                        pointerEvents: "auto",
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,1)",
                        },
                      }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>

                    <IconButton
                      onClick={goNext}
                      sx={{
                        position: "absolute",
                        top: "50%",
                        right: 10,
                        transform: "translateY(-50%)",
                        bgcolor: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(4px)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        zIndex: 11,
                        pointerEvents: "auto",
                        cursor: "pointer",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,1)",
                        },
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>

                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: 0.75,
                        px: 1.25,
                        py: 0.6,
                        borderRadius: 999,
                        bgcolor: "rgba(0,0,0,0.38)",
                        backdropFilter: "blur(4px)",
                        zIndex: 11,
                        pointerEvents: "auto",
                      }}
                    >
                      {images.map((img, index) => (
                        <Box
                          key={img.id}
                          onClick={() => setActiveImageIndex(index)}
                          sx={{
                            width: index === safeImageIndex ? 18 : 8,
                            height: 8,
                            borderRadius: 999,
                            bgcolor:
                              index === safeImageIndex
                                ? "#fff"
                                : "rgba(255,255,255,0.5)",
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {images.length > 1 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  overflowX: "auto",
                  pb: 0.5,
                  scrollbarWidth: "thin",
                }}
              >
                {images.map((img, index) => (
                  <Box
                    key={img.id}
                    component="img"
                    src={img.thumbnailUrl || img.imageUrl}
                    alt={img.altText}
                    onClick={() => setActiveImageIndex(index)}
                    sx={{
                      width: isMobile ? 64 : 76,
                      height: isMobile ? 64 : 76,
                      objectFit: "cover",
                      borderRadius: 1.5,
                      border: "2px solid",
                      borderColor:
                        index === safeImageIndex ? "primary.main" : "divider",
                      cursor: "pointer",
                      flex: "0 0 auto",
                      boxShadow:
                        index === safeImageIndex
                          ? "0 0 0 2px rgba(25,118,210,0.12)"
                          : "none",
                      transition: "all 0.2s ease",
                      backgroundColor: "#f7f4ef",
                      p: 0.25,
                    }}
                  />
                ))}
              </Stack>
            )}

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
                              <Typography variant="body2" color="text.secondary">
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
                                <Typography variant="body2" color="text.secondary">
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
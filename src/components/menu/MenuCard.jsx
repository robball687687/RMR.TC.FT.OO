import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";

const FALLBACK_IMG =
  "https://rmrstorage.blob.core.windows.net/measite/MeaLogoBlackTrans.png";

function getItemImages(item, menuItem) {
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
      imageUrl: item?.itemImage || FALLBACK_IMG,
      thumbnailUrl: item?.itemImage || FALLBACK_IMG,
      altText: item?.itemName || "Menu item",
      displayOrder: 1,
      isPrimary: true,
    },
  ];
}

export default function MenuCard({
  menuItem,
  item,
  onAdd,
  outOfStock = false,
  disabledReason = "",
  disabledLabel = "",
  disabledButtonText = "",
  fixedWidth = 350,
  fixedHeight = 380,
}) {
  const price = Number(item?.itemPrice || 0);
  const fullDesc = item?.itemDesc || "";
  const MAX_LEN = 110;

  const isLong = fullDesc.length > MAX_LEN;
  const shortDesc = isLong
    ? fullDesc.slice(0, MAX_LEN).trimEnd() + "..."
    : fullDesc;

  const images = useMemo(() => getItemImages(item, menuItem), [item, menuItem]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  useEffect(() => {
    setActiveImageIndex(0);
    setTouchStartX(null);
    setTouchEndX(null);
  }, [item?.menuItemId, menuItem]);

  useEffect(() => {
    if (images.length <= 1 || dialogOpen || isHovered) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length, dialogOpen, isHovered]);

  const safeImageIndex =
    activeImageIndex >= 0 && activeImageIndex < images.length ? activeImageIndex : 0;

  const activeImage = images[safeImageIndex] || images[0];
  const ribbonText = outOfStock ? disabledLabel || "Out of stock" : "";
  const btnText = outOfStock ? disabledButtonText || "Out" : "Add";

  const handleOpenDialog = (e) => {
    e?.stopPropagation?.();
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const goPrev = (e) => {
    e?.stopPropagation?.();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = (e) => {
    e?.stopPropagation?.();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddClick = (e) => {
    e?.stopPropagation?.();
    if (!outOfStock) onAdd?.();
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
      goNext();
    } else if (distance < -minSwipeDistance) {
      goPrev();
    }
  };

  return (
    <>
      <Card
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: fixedWidth,
          height: fixedHeight,
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 10px 28px rgba(0,0,0,.10)",
          mx: "auto",
          "&:hover .hero-image": {
            transform: outOfStock ? "none" : "scale(1.03)",
          },
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <Box
            component="img"
            className="hero-image"
            src={activeImage?.imageUrl || FALLBACK_IMG}
            alt={activeImage?.altText || item?.itemName || "Menu item"}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMG;
            }}
            onClick={handleOpenDialog}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 40%",
              transition:
                "transform .35s ease, filter .2s ease, opacity .25s ease",
              willChange: "transform",
              filter: outOfStock ? "grayscale(60%) brightness(0.8)" : "none",
              opacity: outOfStock ? 0.85 : 1,
              cursor: "pointer",
              userSelect: "none",
            }}
          />

          {price > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                px: 1.2,
                py: 0.45,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
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

          {images.length > 1 && (
            <Button
              size="small"
              startIcon={<PhotoLibraryIcon />}
              onClick={handleOpenDialog}
              sx={{
                position: "absolute",
                top: 10,
                left: 10,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.92)",
                color: "text.primary",
                px: 1.2,
                minWidth: 0,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.98)",
                },
              }}
            >
              {images.length}
            </Button>
          )}

          {images.length > 1 && (
            <>
              <IconButton
                onClick={goPrev}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: 10,
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(4px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                  opacity: isHovered ? 1 : 0.85,
                  transition: "opacity 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.96)",
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
                  bgcolor: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(4px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                  opacity: isHovered ? 1 : 0.85,
                  transition: "opacity 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.96)",
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>

              <Box
                sx={{
                  position: "absolute",
                  left: "50%",
                  bottom: 100,
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 0.75,
                  px: 1.1,
                  py: 0.5,
                  borderRadius: 999,
                  bgcolor: "rgba(0,0,0,0.35)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {images.map((img, index) => (
                  <Box
                    key={`dot-${img.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex(index);
                    }}
                    sx={{
                      width: index === safeImageIndex ? 16 : 7,
                      height: 7,
                      borderRadius: 999,
                      bgcolor:
                        index === safeImageIndex
                          ? "#fff"
                          : "rgba(255,255,255,0.55)",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Box>
            </>
          )}

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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ color: "#fff", fontWeight: 800, flex: 1, minWidth: 0 }}
                title={item?.itemName}
              >
                {item?.itemName}
              </Typography>

              <Tooltip
                title={outOfStock ? disabledReason || "Currently unavailable" : ""}
              >
                <span>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={outOfStock}
                    onClick={handleAddClick}
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

            {outOfStock && disabledReason && (
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}
              >
                {disabledReason}
              </Typography>
            )}

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
                    onClick={handleOpenDialog}
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
        </Box>
      </Card>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
          }}
        >
          <Typography variant="h6" sx={{ mr: 1 }}>
            {item?.itemName}
          </Typography>
          <IconButton onClick={handleCloseDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ position: "relative", mb: 2 }}>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: { xs: 260, sm: 360, md: 460 },
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
                backgroundColor: "#f7f4ef",
              }}
            >
              <Box
                component="img"
                src={activeImage?.imageUrl || FALLBACK_IMG}
                alt={activeImage?.altText || item?.itemName || "Menu item"}
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
                }}
              />

              <Box
                component="img"
                src={activeImage?.imageUrl || FALLBACK_IMG}
                alt={activeImage?.altText || item?.itemName || "Menu item"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMG;
                }}
                sx={{
                  position: "relative",
                  zIndex: 1,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  p: 1,
                }}
              />
            </Box>

            {images.length > 1 && (
              <>
                <IconButton
                  onClick={goPrev}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 12,
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(255,255,255,0.88)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.98)" },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>

                <IconButton
                  onClick={goNext}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 12,
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(255,255,255,0.88)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.98)" },
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
                  }}
                >
                  {images.map((img, index) => (
                    <Box
                      key={`dialog-dot-${img.id}`}
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
              </>
            )}
          </Box>

          {images.length > 1 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mb: 2,
                overflowX: "auto",
                pb: 0.5,
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
                    width: 82,
                    height: 82,
                    objectFit: "cover",
                    borderRadius: 1.5,
                    border: "2px solid",
                    borderColor:
                      index === safeImageIndex ? "primary.main" : "divider",
                    flex: "0 0 auto",
                    cursor: "pointer",
                    backgroundColor: "#f7f4ef",
                    p: 0.25,
                  }}
                />
              ))}
            </Box>
          )}

          {!!fullDesc && (
            <Typography variant="body1" sx={{ mb: 1.5 }}>
              {fullDesc}
            </Typography>
          )}

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
                handleCloseDialog();
              }}
            >
              Add to cart
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
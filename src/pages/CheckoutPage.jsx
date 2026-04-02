import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  Divider,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Paper,
  Grid,
  Stack,
  Chip,
  InputAdornment,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PercentIcon from "@mui/icons-material/Percent";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PersonIcon from "@mui/icons-material/Person";
import { useCart } from "../store/CartContext";
import { useNavigate } from "react-router-dom";
import { saveLastOrder } from "../utils/orderStorage";
import ThaiPaperBackground from "../components/common/ThaiPaperBackground";
import couponApi from "../services/couponApi";
import meaFTPaymentApi from "../services/meaFTPaymentApi";

const ORDER_TYPE = "FT-Pickup";
const ORDER_SOURCE = "MEAFTONLINE";
const SALES_TAX_RATE = 0.07;

const formatSelectedOptions = (opts) => {
  if (!opts) return "";

  const parts = Object.values(opts)
    .flatMap((val) => (Array.isArray(val) ? val : [val]))
    .filter(Boolean)
    .map((v) => {
      const label = v.displayName || v.valueName || "";
      const price = Number(v.priceAdjustment || 0);
      return `• ${label}${price > 0 ? ` (+$${price.toFixed(2)})` : ""}`;
    });

  return parts.join(" ");
};

const getOptionTotal = (opts, qty = 1) => {
  if (!opts) return 0;

  const optionSumPerUnit = Object.values(opts)
    .flatMap((val) => (Array.isArray(val) ? val : [val]))
    .filter(Boolean)
    .reduce((sum, v) => sum + Number(v.priceAdjustment || 0), 0);

  return optionSumPerUnit * qty;
};

const lineTotal = (item) => {
  const qty = Number(item.qty || 1);

  const explicit =
    (Number.isFinite(item.totalPrice) && Number(item.totalPrice)) ||
    (Number.isFinite(item.lineTotal) && Number(item.lineTotal)) ||
    (Number.isFinite(item.total) && Number(item.total));

  if (Number.isFinite(explicit)) return explicit;

  const unit = Number(item.unitPrice ?? item.price ?? 0);
  const optionTotal = getOptionTotal(item.options, qty);

  return unit * qty + optionTotal;
};

export default function CheckoutPage() {
  const { cartItems, addToCart, removeFromCart, removeAllOfItem, clearCart } =
    useCart();
  const navigate = useNavigate();

  const [tipPercent, setTipPercent] = useState(10);
  const [discountCode, setDiscountCode] = useState("");
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [placing, setPlacing] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expDate, setExpDate] = useState("");
  const [cvv, setCvv] = useState("");

  const subtotal = cartItems.reduce((sum, item) => sum + lineTotal(item), 0);

  const rawDiscount = parseFloat(discountValue) || 0;
  const percentAsDecimal =
    discountType === "percent"
      ? rawDiscount > 1
        ? rawDiscount / 100
        : rawDiscount
      : 0;

  const discount =
    discountType === "percent"
      ? subtotal * percentAsDecimal
      : discountType === "flat"
      ? Math.min(rawDiscount, subtotal)
      : 0;

  const taxableAmount = Math.max(subtotal - discount, 0);
  const tip = taxableAmount * (tipPercent / 100);
  const tax = taxableAmount * SALES_TAX_RATE;
  const total = taxableAmount + tax + tip;

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/menu");
    }
  }, [cartItems, navigate]);

  const handleApplyCoupon = async () => {
    try {
      const data = await couponApi.checkCoupon(discountCode);

      if (data.validCoupon) {
        const typeRaw = String(data.couponType ?? "").toLowerCase();
        const type =
          typeRaw === "1" || typeRaw === "percent"
            ? "percent"
            : typeRaw === "2" || typeRaw === "flat"
            ? "flat"
            : "";

        const valueNum = parseFloat(data.couponValue);
        setDiscountType(type);
        setDiscountValue(Number.isFinite(valueNum) ? valueNum : 0);
        setCouponMessage("Coupon applied successfully!");
      } else {
        setDiscountType("");
        setDiscountValue(0);
        setCouponMessage("Invalid coupon.");
      }
    } catch (error) {
      console.error("Coupon validation error:", error);
      setCouponMessage("Error validating coupon.");
    }
  };

  const validateForm = () => {
    if (
      !name.trim() ||
      !email.includes("@") ||
      phone.replace(/\D/g, "").length < 10
    ) {
      setErrorMessage("Please enter a valid name, email, and phone number.");
      return false;
    }

    const cleanCard = cardNumber.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cleanCard) && !/^3[47]\d{13}$/.test(cleanCard)) {
      setErrorMessage("Card number must be 16 digits or 15 digits for Amex.");
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expDate)) {
      setErrorMessage("Expiration date must be in MM/YY format.");
      return false;
    }

    const [month, year] = expDate.split("/");
    const monthNum = Number(month);

    if (!monthNum || monthNum < 1 || monthNum > 12) {
      setErrorMessage("Expiration month must be between 01 and 12.");
      return false;
    }

    const isAmex = /^3[47]\d{13}$/.test(cleanCard);
    if (!(isAmex ? /^\d{4}$/.test(cvv) : /^\d{3}$/.test(cvv))) {
      setErrorMessage("CVV must be 3 digits, or 4 digits for Amex.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const buildFoodTruckOrderItems = () =>
    cartItems.map((item) => ({
      meaFTMenuItemId: Number(item.id),
      id: Number(item.id),
      name: item.name,
      unitPrice: Number(item.unitPrice ?? item.price ?? 0),
      price: Number(item.unitPrice ?? item.price ?? 0),
      quantity: Number(item.qty || 1),
      amount: Number(item.qty || 1),
      selOptions: item.options
        ? Object.entries(item.options).flatMap(([optionId, value]) => {
            const values = Array.isArray(value) ? value : [value];

            return values.map((v) => ({
              optionId: parseInt(optionId, 10),
              optionValue: v.displayName || v.valueName || "",
              price: Number(v.priceAdjustment || 0),
              meaFTMenuItemOptionId: parseInt(optionId, 10),
              meaFTMenuItemOptionValueId: Number(
                v.meaFTMenuItemOptionValueId || 0
              ),
            }));
          })
        : [],
      selectedOptions: item.options
        ? Object.entries(item.options).flatMap(([optionId, value]) => {
            const values = Array.isArray(value) ? value : [value];

            return values.map((v) => ({
              meaFTMenuItemOptionId: parseInt(optionId, 10),
              meaFTMenuItemOptionValueId: Number(
                v.meaFTMenuItemOptionValueId || 0
              ),
              optionValue: v.displayName || v.valueName || "",
              price: Number(v.priceAdjustment || 0),
            }));
          })
        : [],
    }));

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setPlacing(true);

    const [month, year] = expDate.split("/");

    const orderItems = buildFoodTruckOrderItems();

    const secureData = {
      AuthData: {
        ClientKey: "your-client-key-here",
        APILoginID: "your-api-login-id-here",
      },
      CardData: {
        Name: name,
        Phone: phone,
        Email: email,
        CardNumber: cardNumber.replace(/\s/g, ""),
        Month: month,
        Year: `20${year}`,
        CardCode: cvv,
        TipRaw: tipPercent.toString(),
        TipTotalDisplay: `$${tip.toFixed(2)}`,
        TipTotal: tip.toFixed(2),
        Coupon: discountCode,
      },
    };

    const payload = {
      data: orderItems,
      orderType: ORDER_TYPE,
      source: ORDER_SOURCE,
      SecureData: secureData,
    };

    try {
      const apiOrder = (await meaFTPaymentApi.processPayment(payload)) || {};
      const orderId =
        apiOrder.orderId ??
        `TEMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const lastOrder = {
        orderId,
        placedAt: new Date().toISOString(),
        name,
        phone,
        email,
        orderType: ORDER_TYPE,
        source: ORDER_SOURCE,
        totals: {
          subtotal: subtotal.toFixed(2),
          discount: discount.toFixed(2),
          tax: tax.toFixed(2),
          tip: tip.toFixed(2),
          total: total.toFixed(2),
        },
        items: cartItems.map((i) => ({
          id: i.id,
          name: i.name,
          qty: i.qty || 1,
          price: i.price,
          lineTotal: lineTotal(i),
          options: i.options || null,
        })),
        payment: {
          method: "Card",
          transactionId: apiOrder.transactionId,
        },
      };

      saveLastOrder(lastOrder);
      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      console.error("Food truck order creation failed:", err);
      setErrorMessage("There was a problem placing your order.");
    } finally {
      setPlacing(false);
    }
  };

  const Label = ({ children }) => (
    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
      {children}
    </Typography>
  );

  return (
    <ThaiPaperBackground>
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, letterSpacing: 0.3, mb: 2 }}
        >
          Checkout
        </Typography>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={7}>
            <Stack spacing={2.25}>
              <Paper
                variant="outlined"
                sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2 }}
              >
                <Label>Your Order</Label>
                <List sx={{ py: 0 }}>
                  {cartItems.map((item, index) => (
                    <Box key={`${item.id}-${index}`}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          px: 0,
                          flexDirection: "column",
                          alignItems: "flex-start",
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
                            <Typography
                              sx={{ fontWeight: 700 }}
                              noWrap
                              title={item.name}
                            >
                              {item.name}
                            </Typography>

                            {item.options && (
                              <Typography variant="body2" color="text.secondary">
                                {formatSelectedOptions(item.options)}
                              </Typography>
                            )}
                          </Box>

                          <Box
                            display="flex"
                            alignItems="center"
                            sx={{ flexShrink: 0 }}
                          >
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
                            <Button
                              size="small"
                              color="error"
                              onClick={() => removeAllOfItem(item)}
                              sx={{ minWidth: 0, ml: 1 }}
                            >
                              ❌
                            </Button>
                          </Box>
                        </Box>

                        <Typography variant="body2" mt={0.5}>
                          ${lineTotal(item).toFixed(2)}
                        </Typography>
                      </ListItem>
                      <Divider />
                    </Box>
                  ))}
                </List>
              </Paper>

              <Paper
                variant="outlined"
                sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2 }}
              >
                <Label>Savings & Tip</Label>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  <TextField
                    fullWidth
                    label="Discount Code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalOfferIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleApplyCoupon}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Apply
                  </Button>
                </Stack>

                {couponMessage && (
                  <Alert sx={{ mt: 1.25 }} severity="info">
                    {couponMessage}
                  </Alert>
                )}

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1.5, flexWrap: "wrap" }}
                >
                  {[0, 10, 15, 20].map((p) => (
                    <Chip
                      key={p}
                      icon={<PercentIcon />}
                      label={`${p}%`}
                      onClick={() => setTipPercent(p)}
                      color={tipPercent === p ? "primary" : "default"}
                      variant={tipPercent === p ? "filled" : "outlined"}
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </Stack>

                <FormControl fullWidth sx={{ mt: 1.25 }}>
                  <InputLabel>Custom Tip</InputLabel>
                  <Select
                    value={tipPercent}
                    label="Custom Tip"
                    onChange={(e) => setTipPercent(Number(e.target.value))}
                  >
                    <MenuItem value={tipPercent}>{tipPercent}%</MenuItem>
                    {[5, 8, 12, 18, 22, 25].map((p) => (
                      <MenuItem key={p} value={p}>
                        {p}%
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>

              <Paper
                variant="outlined"
                sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2 }}
              >
                <Label>Contact Information</Label>
                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    inputMode="tel"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIphoneIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="Digits only, e.g. 5551234567"
                  />
                </Stack>
              </Paper>

              <Paper
                variant="outlined"
                sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2 }}
              >
                <Label>Payment</Label>
                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(e.target.value.replace(/[^\d]/g, ""))
                    }
                    autoComplete="cc-number"
                    inputMode="numeric"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CreditCardIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    helperText="16 digits (Visa/Mastercard/etc.) or 15 for Amex"
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                    <TextField
                      fullWidth
                      placeholder="MM/YY"
                      label="Expiration (MM/YY)"
                      value={expDate}
                      onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, ""); // numbers only

                          if (value.length >= 3) {
                            value = value.slice(0, 2) + "/" + value.slice(2, 4);
                          }

                          setExpDate(value.slice(0, 5)); // max MM/YY
                        }}
                      autoComplete="cc-exp"
                      inputMode="numeric"
                    />
                    <TextField
                      fullWidth
                      label="CVV"
                      value={cvv}
                      onChange={(e) =>
                        setCvv(e.target.value.replace(/[^\d]/g, ""))
                      }
                      autoComplete="cc-csc"
                      inputMode="numeric"
                      helperText="3 digits (4 for Amex)"
                    />
                  </Stack>
                </Stack>
              </Paper>

              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

              <Alert severity="warning" sx={{ fontSize: 13, lineHeight: 1.5 }}>
                <strong>Important:</strong> This online ordering system is for
                <strong> food trailer pickup orders only</strong>.
                <br />
                It is <strong>not for our dine-in restaurant</strong>.
                <br />
                Please make sure you are ordering for pickup at the trailer
                location.
                <br />
                We do not issue refunds for orders that are not picked up.
              </Alert>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ py: 1.25, fontWeight: 800, borderRadius: 2 }}
                disabled={placing}
                onClick={handlePlaceOrder}
              >
                {placing ? "Processing…" : `Place Order • $${total.toFixed(2)}`}
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, md: 2 },
                borderRadius: 2,
                position: { md: "sticky" },
                top: { md: 16 },
              }}
            >
              <Label>Order Summary</Label>
              <Stack spacing={1}>
                <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <Row label="Discount" value={`-$${discount.toFixed(2)}`} />
                <Row
                  label={`Tax (${(SALES_TAX_RATE * 100).toFixed(0)}%)`}
                  value={`$${tax.toFixed(2)}`}
                />
                <Row
                  label={`Tip (${tipPercent}%)`}
                  value={`$${tip.toFixed(2)}`}
                />
              </Stack>
              <Divider sx={{ my: 1.25 }} />
              <Row
                label={<Typography sx={{ fontWeight: 800 }}>Total</Typography>}
                value={
                  <Typography sx={{ fontWeight: 800 }}>
                    ${total.toFixed(2)}
                  </Typography>
                }
              />
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mt: 1.5 }}
                onClick={() => clearCart()}
              >
                Clear Cart
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Backdrop
        open={placing}
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </ThaiPaperBackground>
  );
}

function Row({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.5,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
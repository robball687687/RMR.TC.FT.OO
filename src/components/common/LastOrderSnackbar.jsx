import { Snackbar, Button, Box } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

export default function LastOrderSnackbar({ open, lastOrderId, onView, onDismiss }) {
  return (
    <Snackbar open={open} onClose={onDismiss} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
      <MuiAlert
        onClose={onDismiss}
        severity="success"
        variant="filled"
        sx={{ width: "100%", display: "flex", alignItems: "center", gap: 1 }}
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button color="inherit" size="small" onClick={() => onView(lastOrderId)}>View</Button>
            <Button color="inherit" size="small" onClick={onDismiss}>Dismiss</Button>
          </Box>
        }
      >
        Your last order was placed successfully.
      </MuiAlert>
    </Snackbar>
  );
}

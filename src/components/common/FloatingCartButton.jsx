import { Box, Typography } from "@mui/material";

export default function FloatingCartButton({ onClick, count, icon }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        position: "fixed",
        bottom: 20,
        mb: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1200,
        width: "90%",
        maxWidth: 400,
        bgcolor: "primary.main",
        color: "#fff",
        borderRadius: "50px",
        boxShadow: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 1.2,
        px: 3,
        cursor: "pointer",
      }}
    >
      {icon}
      <Typography variant="body1">View Cart ({count} item{count !== 1 ? "s" : ""})</Typography>
    </Box>
  );
}

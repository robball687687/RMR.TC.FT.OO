import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <Box textAlign="center" p={3}>
      <Typography variant="h3" gutterBottom>
        Welcome to The Mea Thai
      </Typography>
      <Typography variant="body1" gutterBottom>
        Order your favorite Thai dishes online!
      </Typography>
      <Button variant="contained" component={Link} to="/menu">
        View Menu
      </Button>
    </Box>
  );
}

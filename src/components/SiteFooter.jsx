import React from "react";
import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import LLLFeedback from "./LLLFeedback";

export default function SiteFooter() {
  return (
    <Box component="footer" sx={{ mt: 4, pt: 3, pb: 6, borderTop: "1px solid", borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} The Mea Thai Cuisine • Plymouth, MA
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>          
          <MuiLink href="tel:1978763044">(978) 763-3044</MuiLink>
        </Typography>

        {/* Your feedback widget (inline block in the footer) */}
        <Box sx={{ mt: 2 }}>
          <LLLFeedback />
        </Box>
      </Container>
    </Box>
  );
}

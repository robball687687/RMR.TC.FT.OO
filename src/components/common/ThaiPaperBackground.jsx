// components/common/ThaiPaperBackground.jsx
import React from "react";
import { Box } from "@mui/material";

export default function ThaiPaperBackground({ children, intensity = 1 }) {
  // slightly stronger tones if you pass intensity > 1
  const gridAlpha = 0.05 * intensity;
  const vignetteAlpha = 0.04 * intensity;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        // light paper base
        background:
          "radial-gradient(80% 60% at 50% 0%, rgba(255,255,255,.92), rgba(255,255,255,1))",
        // keep stacking context; content sits above
        "> *": { position: "relative", zIndex: 1 },

        // rice paper fibers + warm vignette (fixed behind everything)
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(1px 2px at 22% 30%, rgba(0,0,0,.035) 0, transparent 55%),
            radial-gradient(1px 1px at 70% 65%, rgba(0,0,0,.03) 0, transparent 60%),
            radial-gradient(2px 1px at 42% 82%, rgba(0,0,0,.028) 0, transparent 65%),
            radial-gradient(120% 90% at 50% -10%, rgba(220,38,38,${vignetteAlpha}), transparent 60%)
          `,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px, 200px 200px, 220px 220px, 100% 100%",
        },

        // faint lotus/grid overlay (fixed)
        "&::after": {
          content: '""',
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 1,
          backgroundImage: `
            linear-gradient(rgba(244,63,94, ${gridAlpha}) 1px, transparent 1px),
            linear-gradient(90deg, rgba(244,63,94, ${gridAlpha}) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          // soften towards edges
          maskImage:
            "radial-gradient(120% 90% at 50% 10%, black 60%, transparent 92%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 50% 10%, black 60%, transparent 92%)",
        },
      }}
    >
      {children}
    </Box>
  );
}

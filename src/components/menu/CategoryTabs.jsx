// src/components/menu/CategoryTabs.jsx
import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

export default function CategoryTabs({ categories = [], value = 0, onChange }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: 44,
          "& .MuiTabs-flexContainer": {
            gap: 1,
          },
          "& .MuiTab-root": {
            minHeight: 44,
            minWidth: "auto",
            px: 2,
            borderRadius: 999,
            textTransform: "none",
            fontWeight: 700,
          },
        }}
      >
        {categories.map((category, index) => {
          const label =
            category?.categoryName ||
            category?.CategoryName ||
            category?.name ||
            `Category ${index + 1}`;

          return <Tab key={index} label={label} />;
        })}
      </Tabs>
    </Box>
  );
}
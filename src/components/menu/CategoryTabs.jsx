import { Tabs, Tab } from "@mui/material";

export default function CategoryTabs({ categories, value, onChange }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="scrollable"
      centered
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{ mt: 2, justifyContent: "center" }}
    >
      {categories.map((cat, idx) => (
        <Tab key={idx} label={cat.categoryName} />
      ))}
    </Tabs>
  );
}

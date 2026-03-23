import { TextField } from "@mui/material";

export default function SearchBar({ value, onChange }) {
  return (
    <TextField
      label="Search menu..."
      variant="outlined"
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

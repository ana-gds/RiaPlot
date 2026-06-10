import { useState } from "react";
import { SearchBar } from "../shared/SearchBar.jsx";

export function MapSearchBar() {
  const [value, setValue] = useState("");
  return (
    <SearchBar
      value={value}
      onChange={setValue}
      onClear={() => setValue("")}
      placeholder="Procura um cais ou local..."
    />
  );
}

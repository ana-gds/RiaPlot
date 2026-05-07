import { BackButton } from "../ui/BackButton.jsx";
import { MapSearchBar } from "./MapSearchBar.jsx";
import { LayerSwitcher } from "./LayerSwitcher.jsx";

export function MapHeader({ baseLayer, onChangeLayer, nautical, onToggleNautical }) {
  return (
    <div className="map-header">
      <div className="map-header__row">
        <BackButton className="flex-shrink-0" />
        <MapSearchBar />
        <LayerSwitcher
          activeLayer={baseLayer}
          onChangeLayer={onChangeLayer}
          nautical={nautical}
          onToggleNautical={onToggleNautical}
        />
      </div>
    </div>
  );
}

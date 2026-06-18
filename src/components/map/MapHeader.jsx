import { MapSearchBar } from "./MapSearchBar.jsx";
import { LayerSwitcher } from "./LayerSwitcher.jsx";
import { CircularButton } from "../ui/Button.jsx";
import { MenuIcon } from "../ui/Icons.jsx";

export function MapHeader({
  baseLayer,
  onChangeLayer,
  onOpenMenu,
  docks,
  pois,
  onSearchSelect,
}) {
  return (
    <div className="map-header" >
      <div className="map-header__row">
        {onOpenMenu && (
          <CircularButton onClick={onOpenMenu} ariaLabel="Menu" className="md:hidden">
            <MenuIcon />
          </CircularButton>
        )}
        <MapSearchBar docks={docks} pois={pois} onSelect={onSearchSelect} />
        <LayerSwitcher
          activeLayer={baseLayer}
          onChangeLayer={onChangeLayer}
        />
      </div>
    </div>
  );
}

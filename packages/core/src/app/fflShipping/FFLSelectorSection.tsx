import React from 'react';
import FFLSelector from './FFLSelector';
import { FFL } from './CustomShippingStep';

const FFLSelectorSection: React.FC<{
  show: boolean;
  fflLocations: FFL[] | null;
  selectedFFL: FFL | null;
  setSelectedFFL: React.Dispatch<React.SetStateAction<FFL | null>>;
  setPickupAtSS: React.Dispatch<React.SetStateAction<boolean>>;
  shootStraightIds: number[];
  pickupAtSS: boolean;
}> = ({ show, fflLocations, selectedFFL, setSelectedFFL, setPickupAtSS, shootStraightIds, pickupAtSS }) => {
  const handleSelectFFL = (ffl: FFL) => {
    if (shootStraightIds.includes(ffl?.id)) setPickupAtSS(true);
    setSelectedFFL(ffl || null);
  };
  return show ? (
    <FFLSelector
      ffls={fflLocations}
      handleSelectFFL={handleSelectFFL}
      selectedFFL={selectedFFL}
      pickupAtSS={pickupAtSS}
    />
  ) : null;
};

export default FFLSelectorSection;

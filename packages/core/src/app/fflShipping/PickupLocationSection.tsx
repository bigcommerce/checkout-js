import React from 'react';
import PickupLocationSelector from './PickupLocationSelector';

const PickupLocationSection: React.FC<{
  hasFirearms: boolean;
  pickupAtSS: boolean;
  setPickupAtSS: React.Dispatch<React.SetStateAction<boolean>>;
  setCustomFFL: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFFL: React.Dispatch<React.SetStateAction<any>>;
}> = ({ hasFirearms, pickupAtSS, setPickupAtSS, setCustomFFL, setSelectedFFL }) => {
  const handleSetPickupAtSS = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    setPickupAtSS(target.id === 'ssPickup');
    setCustomFFL(false);
    setSelectedFFL(null);
  };
  return (
    <>
      <PickupLocationSelector
        hasFirearms={hasFirearms}
        pickupAtSS={pickupAtSS}
        handleSetPickupAtSS={handleSetPickupAtSS}
      />
    </>
  );
};

export default PickupLocationSection;

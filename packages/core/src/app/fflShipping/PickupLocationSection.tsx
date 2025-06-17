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
    <label>
      <PickupLocationSelector
        hasFirearms={hasFirearms}
        pickupAtSS={pickupAtSS}
        handleSetPickupAtSS={handleSetPickupAtSS}
      />
      <h2 className="customShippingSectionHeader">
        {!hasFirearms && !pickupAtSS
          ? ''
          : pickupAtSS
            ? 'Shoot Straight Location'
            : 'FFL Location'}
      </h2>
      <p className=''>{!hasFirearms && !pickupAtSS
        ? ''
        : pickupAtSS
          ? 'All products will be sent to your selected Shoot Straight location.'
          : 'Only firearms will be sent to your selected FFL.'}</p>


    </label>
  );
};

export default PickupLocationSection;

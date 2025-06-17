import React from 'react';
import PickupLocationOption from './PickupLocationOption';

interface PickupLocationSelectorProps {
  hasFirearms: boolean;
  pickupAtSS: boolean;
  handleSetPickupAtSS: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const PickupLocationSelector: React.FC<PickupLocationSelectorProps> = ({
  hasFirearms,
  pickupAtSS,
  handleSetPickupAtSS,
}) => (
  <div className="pickupLocationContainer">
    <PickupLocationOption 
      pickupAtSS={pickupAtSS}
      handleSetPickupAtSS={handleSetPickupAtSS}
      id='ssPickup'
      className={`pickupOption ${pickupAtSS ? 'selectedPickupOption' : ''}`}
      name='Pickup at Shoot Straight'
    />
    {hasFirearms && (
      <PickupLocationOption 
        pickupAtSS={!pickupAtSS}
        handleSetPickupAtSS={handleSetPickupAtSS}
        id='otherFFLPickup'
        className={`pickupOption ${!pickupAtSS ? 'selectedPickupOption' : ''}`}
        name='Pickup at other FFL'
      />
    )}
    {! hasFirearms && (
      <PickupLocationOption 
        pickupAtSS={!pickupAtSS}
        handleSetPickupAtSS={handleSetPickupAtSS}
        id='shipToHome'
        className={`pickupOption ${!pickupAtSS ? 'selectedPickupOption' : ''}`}
        name='Ship to Home'
      />
    )}
  </div>
);

export default PickupLocationSelector;

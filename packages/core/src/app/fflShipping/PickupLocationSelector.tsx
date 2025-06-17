import React from 'react';

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
    <div
      id="ssPickup"
      className={`pickupOption ${pickupAtSS ? 'selectedPickupOption' : ''}`}
      onClick={handleSetPickupAtSS}
    >
      Pickup at Shoot Straight
    </div>
    {hasFirearms && (
      <div
        id="otherFFLPickup"
        className={`pickupOption ${!pickupAtSS ? 'selectedPickupOption' : ''}`}
        onClick={handleSetPickupAtSS}
      >
        Pickup at other FFL
      </div>
    )}
    {!hasFirearms && (
      <div
        id="shipToHome"
        className={`pickupOption ${!pickupAtSS ? 'selectedPickupOption' : ''}`}
        onClick={handleSetPickupAtSS}
      >
        Ship to home
      </div>
    )}
  </div>
);

export default PickupLocationSelector;

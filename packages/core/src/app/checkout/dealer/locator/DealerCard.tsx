import React from 'react';

import Fees from './Fees';
import Schedules from './Schedules';

export default function DealerCard(props: any): any {
  const { dealer, index } = props;

  const handleSelect = () => props.selectDealer({
      firstName: "FFL",
      lastName: "Manager",
      phone: dealer.phone_number,
      company: `${dealer.business_name} - ${dealer.license}`,
      address1: dealer.premise_street,
      address2: '',
      city: dealer.premise_city,
      stateOrProvinceCode: dealer.premise_state,
      shouldSaveAddress: false,
      postalCode: dealer.premise_zip,
      localizedCountry: 'United States',
      countryCode: 'US',
      fflID: dealer.license
  });

  const dealerType = dealer.preferred
    ? "locator-modal-dealer preferred"
    : "locator-modal-dealer"

  return (
    <div className={ dealerType }>
    <div className="locator-modal-dealer-index">{index +1}</div>
    <div className="locator-modal-dealer-content">
    <div>
      {
        dealer.preferred && <div title="Preferred Dealer" className="locator-modal-dealer-star"></div>
      }
      {dealer.business_name}
    </div>
      <div>{`${dealer.premise_street}, ${dealer.premise_city}, ${dealer.premise_state} ${dealer.premise_zip}`}</div>
      <div>{dealer.phone_number}</div>
    </div>
    <Fees fees={dealer.fees} />
    <Schedules schedules={dealer.schedules} />
    <button
      className="locator-button dealer"
      onClick={ handleSelect }>select</button>
  </div>)
}

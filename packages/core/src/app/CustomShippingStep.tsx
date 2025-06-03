import React, { useState, useEffect, useRef } from 'react';
import {
  Customer,
  Cart,
  CheckoutSelectors,
  ConsignmentsRequestBody,
  ConsignmentCreateRequestBody,
  Address,
  Consignment,
  CheckoutRequestBody

} from '@bigcommerce/checkout-sdk';
import { withCheckout } from './checkout';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';

import data from './shipping/locations.json';
import './CustomShippingStep.scss';
import FFLSelector from './FFLSelector';
import CustomAddressForm from './CustomAddressForm';
import "./CustomAddressForm.scss"


export type FFL = {
  id: number;
  name: string;
  address: Address;
};

export interface WithCheckoutCustomShippingProps {
  cart: Cart;
  customer: Customer;
  consignments: Consignment[];
  createConsignments: (consignments: ConsignmentsRequestBody) => Promise<CheckoutSelectors>;
  selectConsignmentShippingOption: (consignmentId: string, shippingOptionId: string) => Promise<CheckoutSelectors>;
  updateCheckout(payload: CheckoutRequestBody): Promise<CheckoutSelectors>;

}

interface CustomShippingProps {
  onContinue: () => void;
}



const shootStraightIds: number[] = data.shootStraightIds;

const CustomShipping: React.FC<WithCheckoutCustomShippingProps & CustomShippingProps> = ({
  cart,
  customer,
  createConsignments,
  onContinue,
  selectConsignmentShippingOption,
  
}) => {
  const lineItemAllocations = useRef<{
    fflitems: { itemId: number | string; quantity: number }[];
    homeItems: { itemId: number | string; quantity: number }[];
  } | null>(null);

  const [selectedFFL, setSelectedFFL] = useState<FFL | null>(null);
  const [validationError, setValidationError] = useState(false);
  const [pickupAtSS, setPickupAtSS] = useState<boolean>(false);
  const [fflLocations, setFFLLocations] = useState<FFL[] | null>(null);

  const [customFFL, setCustomFFL] = useState<boolean>(false);
  const [customFFLData, setCustomFFLData] = useState<any>({
    company: '',
    phone: '',
  });

  const [homeAddress, setHomeAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    stateOrProvince: '',
    stateOrProvinceCode: '',
    postalCode: '',
    country: '',
    countryCode: 'US',
    phone: '',
    customFields: [],
    shouldSaveAddress: false,
  });

  // Prefill home address if customer has saved addresses
  useEffect(() => {
    if (customer?.addresses && customer.addresses.length > 0) {
      const defaultAddress = customer.addresses[0];
      setHomeAddress({
        firstName: defaultAddress.firstName || '',
        lastName: defaultAddress.lastName || '',
        company: defaultAddress.company || '',
        address1: defaultAddress.address1 || '',
        address2: defaultAddress.address2 || '',
        city: defaultAddress.city || '',
        stateOrProvince: defaultAddress.stateOrProvince || '',
        stateOrProvinceCode: defaultAddress.stateOrProvinceCode || 'FL',
        postalCode: defaultAddress.postalCode || '',
        country: defaultAddress.country || '',
        countryCode: defaultAddress.countryCode || 'US',
        phone: defaultAddress.phone || '',
        customFields: defaultAddress.customFields || [],
        shouldSaveAddress: false,
      });
    }
  }, [customer?.addresses]);

  const hasFirearms = cart.lineItems.physicalItems.some(item =>
    item.categoryNames?.includes('Firearms')
  );

  const showManualAddressInputs = cart.lineItems.physicalItems.some(
    item => !item.categoryNames?.includes('Firearms')
  ) && !pickupAtSS;



  useEffect(() => {
    
    setFFLLocations(data.fflLocations);
  }, []);

  // Separate items into FFL and home items
  const getFFLItemIDs = () => {
    const fflItems = [];
    const homeItems = [];
    const lineItems = cart.lineItems.physicalItems;

    for (let i = 0; i < lineItems.length; i++) {
      const category = lineItems[i].categoryNames?.[0] ?? '';
      const id = lineItems[i].id ?? '';
      const quantity = lineItems[i].quantity;

      if (category === 'Firearms') {
        fflItems.push({ itemId: id, quantity });
      } else {
        homeItems.push({ itemId: id, quantity });
      }
    }
    lineItemAllocations.current = { fflitems: fflItems, homeItems };
  };

  useEffect(() => {
    getFFLItemIDs();
  }, [cart]);

  const handleFFLSelected = (ffl: FFL) => {
    if (shootStraightIds.includes(ffl?.id)) {
      setPickupAtSS(true);
    }
    setSelectedFFL(ffl || null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHomeAddress(prev => ({ ...prev, [name]: value }));
    console.log(homeAddress);
  };

  const handleCustomFFLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomFFLData((prev: any) => ({ ...prev, [name]: value }));

    if (name === 'company') {
      setSelectedFFL(prev => {
        if (!prev) return null;
        return {
          ...prev,
          id: prev.id,
          company: value,
          name: value,
          address: {
            ...prev.address,
            company: value
          }
        };
      });
    }

    if (name === 'phone') {
      setSelectedFFL(prev => {
        if (!prev) return null;
        return {
          ...prev,
          address: {
            ...prev.address,
            phone: value
          }
        };
      });
    }

    console.log(selectedFFL);

  };

  const handleSetPickupAtSS = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    setPickupAtSS(target.id === 'ssPickup');
    setCustomFFL(false);
    setSelectedFFL(null);
  };



  const handleCheckCustomFFL = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      console.log("Set custom FFL consignment")
      setSelectedFFL({
        id: 0,
        name: customFFLData.company,
        address: {
          firstName: "-",
          lastName: "-",
          address1: "-",
          city: "-",
          stateOrProvinceCode: "FL",
          postalCode: "-",
          country: '-',
          company: '_',
          address2: '-',
          stateOrProvince: '',
          countryCode: 'US',
          phone: '_',
          customFields: []
        }
      });
      console.log("Check custom ffl")
      setCustomFFL(isChecked);
    } else {
      setSelectedFFL(null);
    }


  };

  // Validates and submits shipping selections
  const handleContinue = async () => {
    const requiredFields = [];



    const customFFLFields = [
      { label: 'FFL Business Name', value: customFFLData.company || '' },
      { label: 'FFL Phone Number', value: customFFLData.phone || '' },
    ];

    const fflFields = [
      { label: 'FFL First Name', value: selectedFFL?.address?.firstName || '' },
      { label: 'FFL Last Name', value: selectedFFL?.address?.lastName || '' },
      { label: 'FFL Company Name', value: selectedFFL?.name || '' },
      { label: 'FFL Address 1', value: selectedFFL?.address?.address1 || '' },
      { label: 'FFL City', value: selectedFFL?.address?.city || '' },
      { label: 'FFL State Code', value: selectedFFL?.address?.stateOrProvinceCode || '' },
      { label: 'FFL Postal Code', value: selectedFFL?.address?.postalCode || '' },
    ];



    const homeFields = [
      { label: 'Home First Name', value: homeAddress?.firstName },
      { label: 'Home Last Name', value: homeAddress?.lastName },
      { label: 'Home Address 1', value: homeAddress?.address1 },
      { label: 'Home City', value: homeAddress?.city },
      { label: 'Home State Code', value: homeAddress?.stateOrProvinceCode },
      { label: 'Home Postal Code', value: homeAddress?.postalCode },
    ];

    if (hasFirearms) requiredFields.push(...fflFields);
    if (!pickupAtSS) requiredFields.push(...homeFields);
    if (customFFL) requiredFields.push(...customFFLFields);

    const emptyFields = requiredFields.filter(field => !field.value.trim());
    
    if (emptyFields.length > 0) {
      console.warn('Missing required fields:', emptyFields.map(f => f.label));
      setValidationError(true);
      return;
    }

    const consignments: ConsignmentCreateRequestBody[] = [];
    const fflItems = lineItemAllocations.current?.fflitems ?? [];
    const homeItems = lineItemAllocations.current?.homeItems ?? [];

    if (fflItems.length > 0 && selectedFFL) {
      const itemsToFFL = pickupAtSS ? [...fflItems, ...homeItems] : fflItems;
      consignments.push({
        address: { ...selectedFFL.address, company: selectedFFL.name, customFields: [] },
        lineItems: itemsToFFL,
      });
    }

    if (homeItems.length > 0 && (!pickupAtSS || !hasFirearms)) {
      consignments.push({
        address: { ...homeAddress, customFields: homeAddress.customFields || [] },
        lineItems: homeItems,
      });
    }

    if (consignments.length === 0) {
      console.warn('No consignments to create.');
      return;
    }




    try {
      const response = await createConsignments(consignments);
      console.log(response);
      const currentConsignments = response.data.getConsignments() ?? [];

      for (const consignment of currentConsignments) {
        const isFFL = consignment.lineItemIds.some(id =>
          lineItemAllocations.current?.fflitems?.some(item => item.itemId === id)
        );

        const optionId = pickupAtSS
          ? 'ff286e83078d1fff1601e5b06cabc8e2'
          : isFFL
            ? 'ba4bfeb633b03cac4e06976b8e8e77c4'
            : '71fadd3406386d6644ce70b46a5bb4f2';

        await selectConsignmentShippingOption(consignment.id, optionId);
      }
      setValidationError(false);
      onContinue();
    } catch (error) {
      console.error('Error processing shipping:', error);
      setValidationError(true);
    }
  };

  return (
    <div>
      <label>
        <h2 className="customShippingSectionHeader">
          {pickupAtSS ? 'Shoot Straight Location' : 'FFL Location'}
        </h2>

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


      </label>
      {!pickupAtSS && hasFirearms && (
        <>


          {customFFL && (
            <div>
              <div className='CustomFormContainer'>

                <div className="formRow">


                  <div className="customFormGroup">
                    <label htmlFor="company">FFL name</label>
                    <input
                      className='customFormInput'
                      type="text"
                      name="company"
                      id="company"
                      placeholder="FFL Name"
                      value={customFFLData.company}
                      onChange={handleCustomFFLInputChange}
                    />
                  </div>

                  <div className="customFormGroup">
                    <label htmlFor="phone">FFL business phone number</label>
                    <input
                      className='customFormInput'
                      type="number"
                      name="phone"
                      id="phone"
                      placeholder="Phone Number"
                      value={customFFLData.phone}
                      onChange={handleCustomFFLInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

          )}

          <div>
            <input onChange={handleCheckCustomFFL} checked={customFFL} name="customFFL" type="checkbox"></input>

            <label>Enter a different FFL</label>
          </div>

        </>

      )}
      {!customFFL && (

        <FFLSelector ffls={fflLocations} handleSelectFFL={handleFFLSelected} selectedFFL={selectedFFL} pickupAtSS={pickupAtSS} />

      )}

      {showManualAddressInputs && (
        <CustomAddressForm savedAddress={homeAddress} handleInputChange={handleInputChange} formState={homeAddress} />
      )}

      <button className="button button--primary optimizedCheckout-buttonPrimary" onClick={handleContinue}>
        Continue
      </button>

      {validationError && <div className="error">Please fill out all required fields.</div>}
    </div>
  );
};

export function mapToShippingProps({
  checkoutService,
  checkoutState,
}: CheckoutContextProps): WithCheckoutCustomShippingProps | null {
  const {
    data: { getCart, getCustomer, getConsignments },
  } = checkoutState;

  const cart = getCart();
  const customer = getCustomer();
  const consignments = getConsignments();

  return cart && customer
    ? {
      cart,
      customer,
      consignments: consignments ?? [],
      createConsignments: checkoutService.createConsignments,
      selectConsignmentShippingOption: checkoutService.selectConsignmentShippingOption,
      updateCheckout: checkoutService.updateCheckout,
    }
    : null;
}

export default withCheckout(mapToShippingProps)(CustomShipping);

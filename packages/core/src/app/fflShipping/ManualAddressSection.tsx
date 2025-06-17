import React from 'react';
import CustomAddressForm from './CustomAddressForm';
import { Address } from '@bigcommerce/checkout-sdk';

const ManualAddressSection: React.FC<{
  hasFirearms: boolean;
  show: boolean;
  homeAddress: Address;
  setHomeAddress: React.Dispatch<React.SetStateAction<Address>>;
}> = ({ hasFirearms, show, homeAddress, setHomeAddress }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setHomeAddress(prev => ({ ...prev, [name]: value }));
  };
  return show ? (
    <CustomAddressForm hasFirearms={hasFirearms} savedAddress={homeAddress} handleInputChange={handleInputChange} formState={homeAddress} />
  ) : null;
};

export default ManualAddressSection;

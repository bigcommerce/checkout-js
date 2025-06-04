import React from 'react';
import CustomFFLForm from './CustomFFLForm';

const CustomFFLSection: React.FC<{
  customFFL: boolean;
  setCustomFFL: React.Dispatch<React.SetStateAction<boolean>>;
  customFFLData: any;
  setCustomFFLData: React.Dispatch<any>;
  setSelectedFFL: React.Dispatch<React.SetStateAction<any>>;
}> = ({ customFFL, setCustomFFL, customFFLData, setCustomFFLData, setSelectedFFL }) => {
  const handleCustomFFLInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomFFLData((prev: any) => ({ ...prev, [name]: value }));
    if (name === 'company') {
      setSelectedFFL((prev: any) => prev ? {
        ...prev,
        id: prev.id,
        company: value,
        name: value,
        address: { ...prev.address, company: value }
      } : null);
    }
    if (name === 'phone') {
      setSelectedFFL((prev: any) => prev ? {
        ...prev,
        address: { ...prev.address, phone: value }
      } : null);
    }
  };
  const handleCheckCustomFFL = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedFFL({
        id: 0,
        name: customFFLData.company,
        address: {
          firstName: '-', lastName: '-', address1: '-', city: '-', stateOrProvinceCode: 'FL',
          postalCode: '-', country: '-', company: '_', address2: '-', stateOrProvince: '',
          countryCode: 'US', phone: '_', customFields: []
        }
      });
      setCustomFFL(isChecked);
    } else {
      setCustomFFL(isChecked);
      setSelectedFFL(null);
    }
  };
  return (
    <>
      {customFFL && (
        <CustomFFLForm
          customFFLData={customFFLData}
          handleCustomFFLInputChange={handleCustomFFLInputChange}
        />
      )}
      <div>
        <input onChange={handleCheckCustomFFL} checked={customFFL} name="customFFL" type="checkbox" style={{ marginRight: '8px' }} />
        <label>Enter a different FFL</label>
      </div>

    </>
  );
};

export default CustomFFLSection;

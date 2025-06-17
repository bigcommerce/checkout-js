import React from 'react';

interface CustomFFLFormProps {
  customFFLData: { company: string; phone: string };
  handleCustomFFLInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomFFLForm: React.FC<CustomFFLFormProps> = ({ customFFLData, handleCustomFFLInputChange }) => (
  <div className='CustomFormContainer'>
    <div className="formRow">
      <div className="customFormGroup">
        <label htmlFor="company">FFL Name</label>
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
        <label htmlFor="phone">FFL Business Phone Number</label>
        <input
          className='customFormInput'
          type="text"
          name="phone"
          id="phone"
          placeholder="Phone Number"
          value={customFFLData.phone}
          onChange={handleCustomFFLInputChange}
        />
      </div>
    </div>
  </div>
);

export default CustomFFLForm;

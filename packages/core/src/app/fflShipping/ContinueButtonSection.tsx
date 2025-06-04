import React from 'react';
import ValidationError from './ValidationError';

const ContinueButtonSection: React.FC<{
  handleContinue: () => void;
  validationError: boolean;
}> = ({ handleContinue, validationError }) => (
  <>
    <button className="button button--primary optimizedCheckout-buttonPrimary" onClick={handleContinue}>
      Continue
    </button>
    {validationError && <ValidationError />}
  </>
);

export default ContinueButtonSection;

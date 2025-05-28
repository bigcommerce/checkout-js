import React from 'react';
import '@testing-library/jest-dom';

import { render, screen } from '@bigcommerce/checkout/test-utils';
import { getCardInstrument } from '@bigcommerce/checkout/test-mocks';

import BigCommercePaymentsFastlaneInstrumentsForm from './BigCommercePaymentsFastlaneInstrumentsForm';
import { CardInstrument } from '@bigcommerce/checkout-sdk';
import { fireEvent } from '@testing-library/react';

import { configure } from '@testing-library/react';

configure({
  testIdAttribute: 'data-test',
});

describe('BigCommercePaymentsFastlaneInstrumentsForm', () => {
  const selectedInstrumentMock = getCardInstrument();

  it('updates selected instrument if user selects another instrument in bigcommerce payments fastlane popup', async () => {
    const newInstrument = {
      ...selectedInstrumentMock,
      bigpayToken: 'newInstrumentNonce123',
      last4: '0004',
    };

    const onChange = (): Promise<CardInstrument> => Promise.resolve(newInstrument);
    const handleSelectInstrument = jest.fn();

    render(
      <BigCommercePaymentsFastlaneInstrumentsForm
        handleSelectInstrument={handleSelectInstrument}
        onChange={onChange}
        selectedInstrument={selectedInstrumentMock}
      />
    );

    const actionButton = screen.getByTestId('big-commerce-payments-fastlane-instrument-change');

    fireEvent.click(actionButton);

    await new Promise((resolve) => process.nextTick(resolve));

    expect(handleSelectInstrument).toHaveBeenCalledWith(newInstrument);
  });
});

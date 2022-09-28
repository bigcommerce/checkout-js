import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';
import React from 'react';
import testRenderer from 'react-test-renderer';

import TranslatedString from './TranslatedString';

describe('TranslatedString Component', () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const language = createLanguageService();

  jest.spyOn(language, 'translate');

  it('renders translated string', () => {
    expect(
      testRenderer
        .create(<TranslatedString id="address.address_line_1_label" language={language} />)
        .toJSON(),
    ).toMatchSnapshot();
  });

  it('calls language.translate', () => {
    expect(
      testRenderer
        .create(<TranslatedString id="address.address_line_1_label" language={language} />)
        .toJSON(),
    ).toMatchSnapshot();

    expect(language.translate).toHaveBeenCalledWith('address.address_line_1_label', undefined);
  });

  it('calls language.translate with data when passed', () => {
    const data = { foo: 'xyz' };

    expect(
      testRenderer
        .create(
          <TranslatedString data={data} id="address.address_line_1_label" language={language} />,
        )
        .toJSON(),
    ).toMatchSnapshot();

    expect(language.translate).toHaveBeenCalledWith('address.address_line_1_label', data);
  });
});

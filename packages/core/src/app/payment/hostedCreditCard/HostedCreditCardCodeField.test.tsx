import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { noop } from 'lodash';
import React, { type FunctionComponent } from 'react';

import { createLocaleContext, LocaleContext, type LocaleContextType } from '@bigcommerce/checkout/locale';
import { render, screen } from '@bigcommerce/checkout/test-utils';

import { getStoreConfig } from '../../config/config.mock';
import { IconHelp } from '../../ui/icon';
import { TooltipTrigger } from '../../ui/tooltip';

import HostedCreditCardCodeField, {
    type HostedCreditCardCodeFieldProps,
} from './HostedCreditCardCodeField';

describe('HostedCreditCardCodeField', () => {
    let HostedCreditCardCodeFieldTest: FunctionComponent<HostedCreditCardCodeFieldProps>;
    let defaultProps: HostedCreditCardCodeFieldProps;
    let initialValues: { ccCvv: string };
    let localeContext: LocaleContextType;

    beforeEach(() => {
        initialValues = { ccCvv: '' };
        localeContext = createLocaleContext(getStoreConfig());
        defaultProps = {
            appearFocused: true,
            id: 'ccCvv',
            name: 'ccCvv',
        };

        HostedCreditCardCodeFieldTest = (props) => (
            <LocaleContext.Provider value={localeContext}>
                <Formik initialValues={initialValues} onSubmit={noop}>
                    <HostedCreditCardCodeField {...props} />
                </Formik>
            </LocaleContext.Provider>
        );
    });

    it('renders field with tooltip icon', () => {
        const { container } = render(<HostedCreditCardCodeFieldTest {...defaultProps} />);

        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_cvv_label')),
        ).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
        expect(container.querySelector('.has-tip')).toBeInTheDocument();
        // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
        expect(container.querySelector('.has-icon')).toBeInTheDocument();
    });

    it('renders tooltip message after hovering on it', async () => {
        const { container } = render(<HostedCreditCardCodeFieldTest {...defaultProps} />);
        // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
        const toolTip = container.querySelector('.has-tip');

        expect(toolTip).toBeInTheDocument();

        await userEvent.hover(toolTip);

        expect(
            screen.getByText(localeContext.language.translate('payment.credit_card_cvv_help_text')),
        ).toBeInTheDocument();
    });
});

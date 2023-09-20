import { MandateTextComponent, MandateTextComponentProps } from './MandateTextComponent';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom'
import React from 'react';

describe('MandateTextComponent',  () => {
    const props: MandateTextComponentProps = {
        mandateText: {
            account_holder_name: 'Test',
            iban: '1343442323',
            payment_reference: 'GDU856858',
        },
        methodId: 'ratepay',
        providerId: 'paypalcommercealternativemethod'
    }
    it('renders component with provided props', () => {
        const { container } = render(<MandateTextComponent {...props}/>);

        expect(container).toMatchSnapshot();
    });
});

import { mount, ReactWrapper } from 'enzyme';
import React from 'react';

import { createLocaleContext, LocaleContext } from '@bigcommerce/checkout/locale';

import { getStoreConfig } from '../config/config.mock';

import AppliedRedeemable from './AppliedRedeemable';

describe('AppliedGiftCertificate', () => {
    let component: ReactWrapper;
    const onRemove = jest.fn();

    beforeEach(() => {
        const localeContext = createLocaleContext(getStoreConfig());
        const AppliedRedeembleContainer = ({ isRemoving }: { isRemoving: boolean }) => (
            <LocaleContext.Provider value={localeContext}>
                <AppliedRedeemable isRemoving={isRemoving} onRemove={onRemove()}>
                    foo
                </AppliedRedeemable>
            </LocaleContext.Provider>
        );

        component = mount(<AppliedRedeembleContainer isRemoving={false} />);
    });

    it('renders children', () => {
        expect(component.find('.redeemable').text()).toBe('foo');
    });

    it('renders children', () => {
        component.find('button').simulate('click');

        expect(onRemove).toHaveBeenCalled();
    });

    it('does not disabled button', () => {
        const button = component.find('[data-test="redeemable-remove"]');

        expect(button.prop('disabled')).toBeFalsy();
        expect(button.hasClass('is-loading')).toBeFalsy();
    });

    it('does disabled button when isRemoving is true', () => {
        component.setProps({ isRemoving: true });
        component.update();

        const button = component.find('[data-test="redeemable-remove"]');

        expect(button.prop('disabled')).toBeTruthy();
        expect(button.hasClass('is-loading')).toBeTruthy();
    });
});

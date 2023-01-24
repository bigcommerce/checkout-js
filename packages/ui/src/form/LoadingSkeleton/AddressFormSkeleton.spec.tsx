import { mount } from 'enzyme';
import React from 'react';

import AddressFormSkeleton from './AddressFormSkeleton';

describe('AddressFormSkeleton', () => {
    it('shows skeleton when loading', () => {
        const component = mount(<AddressFormSkeleton isLoading={true} />);

        expect(component.exists('.address-form-skeleton')).toBe(true);
    });

    it('shows content when loading is complete', () => {
        const content = <div id="content">Hello world</div>;
        const component = mount(
            <AddressFormSkeleton isLoading={false}>{content}</AddressFormSkeleton>,
        );

        expect(component.exists('#content')).toBe(true);
        expect(component.exists('.address-form-skeleton')).toBe(false);
    });
});

import { mount } from 'enzyme';
import React from 'react';

import CustomerSkeleton from './CustomerSkeleton';

describe('CustomerSkeleton', () => {
    it('shows skeleton when loading', () => {
        const component = mount(<CustomerSkeleton isLoading={true} />);

        expect(component.exists('.customer-skeleton')).toBe(true);
    });

    it('shows content when loading is complete', () => {
        const content = <div id="content">Hello world</div>;
        const component = mount(<CustomerSkeleton isLoading={false}>{content}</CustomerSkeleton>);

        expect(component.exists('#content')).toBe(true);
        expect(component.exists('.customer-skeleton')).toBe(false);
    });
});

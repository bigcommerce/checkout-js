import { mount } from 'enzyme';
import React from 'react';

import ChecklistSkeleton from './ChecklistSkeleton';

describe('ChecklistSkeleton', () => {
    it('shows skeleton when loading', () => {
        const component = mount(<ChecklistSkeleton isLoading={true} />);

        expect(component.exists('.checklist-skeleton')).toBe(true);
    });

    it('shows skeleton based on rows parameter', () => {
        const randomRows = Math.floor(Math.random() * 10) + 1;
        const component = mount(<ChecklistSkeleton isLoading={true} rows={randomRows} />);

        expect(component.find('.skeleton-container')).toHaveLength(randomRows);
    });

    it('shows content when loading is complete', () => {
        const content = <div id="content">Hello world</div>;
        const component = mount(<ChecklistSkeleton isLoading={false}>{content}</ChecklistSkeleton>);

        expect(component.exists('#content')).toBe(true);
        expect(component.exists('.checklist-skeleton')).toBe(false);
    });
});

// import { mount } from 'enzyme';
// import React from 'react';
//
// import AddressFormSkeleton from './ChecklistSkeleton';
//
// describe('ChecklistSkeleton', () => {
//     it('shows skeleton when loading', () => {
//         const component = mount(<AddressFormSkeleton isLoading={true} />);
//
//         expect(component.exists('.checklist-skeleton')).toBe(true);
//     });
//
//     it('shows skeleton based on rows parameter', () => {
//         const randomRows = Math.floor(Math.random() * 10) + 1;
//         const component = mount(<AddressFormSkeleton isLoading={true} rows={randomRows} />);
//
//         expect(component.find('ul')).toHaveLength(randomRows);
//     });
//
//     it('hides skeleton when loading finishes', () => {
//         const component = mount(<AddressFormSkeleton isLoading={false} />);
//
//         expect(component.exists('.checklist-skeleton')).toBe(false);
//     });
//
//     it('shows content when loading is complete', () => {
//         const component = mount(
//             <AddressFormSkeleton isLoading={false}>
//                 <div id="content">Hello world</div>
//             </AddressFormSkeleton>,
//         );
//
//         expect(component.html()).toBe('<div><div id="content">Hello world</div></div>');
//         expect(component.exists('.checklist-skeleton')).toBe(false);
//     });
// });

import { mount, shallow } from 'enzyme';
import React from 'react';

import LoadingOverlay from './LoadingOverlay';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingOverlay', () => {
    it('shows loading spinner when loading', () => {
        const component = shallow(<LoadingOverlay isLoading={ true } />);

        expect(component.exists('.loadingOverlay'))
            .toEqual(true);
    });

    it('hides loading spinner when not loading', () => {
        const component = shallow(<LoadingOverlay isLoading={ false } />);

        expect(component.exists('.loadingOverlay'))
            .toEqual(false);
    });

    it('hides content when loading if configured', () => {
        const component = mount(
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={ true }
            >
                <div id="content">Hello world</div>
            </LoadingOverlay>
        );

        expect(component.find('#content').parent().prop('style').display)
            .toEqual('none');

        expect(component.find(LoadingSpinner).prop('isLoading'))
            .toEqual(true);
    });

    it('shows content when loading is complete if configured', () => {
        const component = shallow(
            <LoadingOverlay
                hideContentWhenLoading
                isLoading={ false }
            >
                <div id="content">Hello world</div>
            </LoadingOverlay>
        );

        expect(component.find('#content').parent().prop('style').display)
            .toEqual(undefined);

        expect(component.find(LoadingSpinner).prop('isLoading'))
            .toEqual(false);
    });
});

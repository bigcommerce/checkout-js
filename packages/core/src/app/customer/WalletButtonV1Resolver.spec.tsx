import { render } from "enzyme";
import React from "react";

import CheckoutButtonV1Resolver from "./WalletButtonV1Resolver";

describe('CheckoutButtonV1Resolver', () => {
    it('matches snapshot for applepay', () => {
        const component = render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                methodId="applepay"
                onError={jest.fn()}
                onClick={jest.fn()}
            />
        );

        expect(component).toMatchSnapshot();
    });

    it('matches snapshot for applepay', () => {
        const component = render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                isShowingWalletButtonsOnTop={true}
                methodId="applepay"
                onError={jest.fn()}
                onClick={jest.fn()}
            />
        );

        expect(component).toMatchSnapshot();
    });

    it('matches snapshot for amazonpay', () => {
        const component = render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                isShowingWalletButtonsOnTop={true}
                methodId="amazonpay"
                onError={jest.fn()}
                onClick={jest.fn()}
            />
        );

        expect(component).toMatchSnapshot();
    });

    it('matches snapshot for paypalcommerce', () => {
        const component = render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                isShowingWalletButtonsOnTop={true}
                methodId="paypalcommerce"
                onError={jest.fn()}
                onClick={jest.fn()}
            />
        );

        expect(component).toMatchSnapshot();
    });

    it('matches snapshot for paypalcommercecredit', () => {
        const component = render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                isShowingWalletButtonsOnTop={true}
                methodId="paypalcommercecredit"
                onError={jest.fn()}
                onClick={jest.fn()}
            />
        );

        expect(component).toMatchSnapshot();
    });

    it('matches snapshot for googlepay', () => {
        const component = render(
            <CheckoutButtonV1Resolver
                deinitialize={jest.fn()}
                initialize={jest.fn()}
                isShowingWalletButtonsOnTop={true}
                methodId="googlepay"
                onError={jest.fn()}
                onClick={jest.fn()}
            />
        );

        expect(component).toMatchSnapshot();
    });
});

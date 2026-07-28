import { type CheckoutSelectors, type Consignment } from '@bigcommerce/checkout-sdk/essential';

import { getConsignment } from '../shipping/consignment.mock';
import {
    getShippingOption,
    getShippingOptionPickUpStore,
} from '../shipping/shippingOption/shippingMethod.mock';

import attemptSilentShippingOptionRecovery from './attemptSilentShippingOptionRecovery';

function createSelectConsignmentShippingOptionMock(consignments: Consignment[]) {
    let latest = consignments;

    const fn = jest.fn().mockImplementation((consignmentId: string, shippingOptionId: string) => {
        const consignment = latest.find(({ id }) => id === consignmentId);
        const option = consignment?.availableShippingOptions?.find(
            ({ id }) => id === shippingOptionId,
        );

        if (!option) {
            return Promise.reject(new Error('Shipping option is no longer available'));
        }

        latest = latest.map((c) =>
            c.id === consignmentId ? { ...c, selectedShippingOption: option } : c,
        );

        return Promise.resolve({} as CheckoutSelectors);
    });

    return { selectConsignmentShippingOption: fn, getLatestConsignments: () => latest };
}

describe('attemptSilentShippingOptionRecovery()', () => {
    it('reselects the same shipping option when it is still available at the same price, and resolves true', async () => {
        const previousOption = getShippingOption();
        const previousConsignments: Consignment[] = [
            { ...getConsignment(), selectedShippingOption: previousOption },
        ];

        // Simulates the server response after a coupon apply: the option is
        // still valid at the same price, just no longer selected.
        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: [previousOption],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).toHaveBeenCalledWith(
            refreshedConsignments[0].id,
            previousOption.id,
        );
        expect(didReselect).toBe(true);
    });

    it('reselects when the previously selected option is missing costAfterDiscount (only `cost`), as long as the price actually matches', async () => {
        // Regression test: the SDK types declare costAfterDiscount as
        // required on ShippingOption, but real API responses for
        // consignment.selectedShippingOption have been observed without it
        // (only `cost` present), even though availableShippingOptions
        // entries always have both. Comparing costAfterDiscount directly in
        // that case would read `0 === undefined` as "price changed" even
        // when the price is identical.
        const matchingOption = getShippingOption();
        const previousOption = {
            ...matchingOption,
            costAfterDiscount: undefined,
        } as unknown as ReturnType<typeof getShippingOption>;

        const previousConsignments: Consignment[] = [
            { ...getConsignment(), selectedShippingOption: previousOption },
        ];

        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: [matchingOption],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).toHaveBeenCalledWith(
            refreshedConsignments[0].id,
            matchingOption.id,
        );
        expect(didReselect).toBe(true);
    });

    it('still detects a genuine price change even when costAfterDiscount is missing on the previous option', async () => {
        const previousOption = {
            ...getShippingOption(),
            costAfterDiscount: undefined,
        } as unknown as ReturnType<typeof getShippingOption>;

        const repricedOption = {
            ...getShippingOption(),
            cost: previousOption.cost + 5,
            costAfterDiscount: previousOption.cost + 5,
        };

        const previousConsignments: Consignment[] = [
            { ...getConsignment(), selectedShippingOption: previousOption },
        ];

        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: [repricedOption],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).not.toHaveBeenCalled();
        expect(didReselect).toBe(false);
    });

    it('does not reselect when a new shipping option was added (e.g. a coupon unlocking Free Shipping), even though the previously selected option is unchanged', async () => {
        // Real-world case: applying a FREESHIP coupon added a brand-new
        // "Free Shipping" option to availableShippingOptions, while the
        // previously selected option (Ship by Weight) kept the exact same
        // price. The set of choices genuinely changed, so this should not
        // be silently recovered even though the previous option itself is
        // untouched.
        const previousOption = getShippingOption();

        const previousConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: previousOption,
                availableShippingOptions: [previousOption],
            },
        ];

        const newlyAddedOption = {
            ...getShippingOptionPickUpStore(),
            isRecommended: true,
        };

        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: [newlyAddedOption, previousOption],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).not.toHaveBeenCalled();
        expect(didReselect).toBe(false);
    });

    it('does not reselect when an unrelated shipping option was removed, even though the previously selected option is unchanged', async () => {
        const previousOption = getShippingOption();
        const otherOption = getShippingOptionPickUpStore();

        const previousConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: previousOption,
                availableShippingOptions: [previousOption, otherOption],
            },
        ];

        // otherOption is gone from the refreshed list, even though the
        // previously selected option survives at the same price.
        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: [previousOption],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).not.toHaveBeenCalled();
        expect(didReselect).toBe(false);
    });

    it('does not reselect when the same option id is now priced differently, and resolves false without calling the SDK', async () => {
        const previousOption = getShippingOption();
        const repricedOption = {
            ...previousOption,
            costAfterDiscount: previousOption.costAfterDiscount + 5,
        };

        const previousConsignments: Consignment[] = [
            { ...getConsignment(), selectedShippingOption: previousOption },
        ];

        // Same option id survives, but the coupon changed its price — this
        // should be treated as a genuine change, not silently applied.
        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: [repricedOption],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).not.toHaveBeenCalled();
        expect(didReselect).toBe(false);
    });

    it('does not reselect when the previous option is genuinely gone, and resolves false without calling the SDK', async () => {
        const goneOption = getShippingOptionPickUpStore();
        const recommendedOption = getShippingOption();

        const previousConsignments: Consignment[] = [
            { ...getConsignment(), selectedShippingOption: goneOption },
        ];

        // The old option isn't in the new availableShippingOptions at all —
        // e.g. the coupon unlocked a different set of shipping methods.
        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: [recommendedOption],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).not.toHaveBeenCalled();
        expect(didReselect).toBe(false);
    });

    it('falls back to the recommended option when the consignment had no previous selection at all (e.g. a new multi-shipping split)', async () => {
        const recommendedOption = getShippingOption();

        expect(recommendedOption.isRecommended).toBe(true);

        const previousConsignments: Consignment[] = [
            { ...getConsignment(), selectedShippingOption: undefined },
        ];

        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: [recommendedOption],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).toHaveBeenCalledWith(
            refreshedConsignments[0].id,
            recommendedOption.id,
        );
        expect(didReselect).toBe(true);
    });

    it('resolves false without calling the SDK when there is no previous selection and no recommended option', async () => {
        const previousConsignments: Consignment[] = [
            { ...getConsignment(), selectedShippingOption: undefined },
        ];

        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                selectedShippingOption: undefined,
                availableShippingOptions: [],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).not.toHaveBeenCalled();
        expect(didReselect).toBe(false);
    });

    it('is all-or-nothing across multiple consignments: one genuine change blocks reselection for all, even an otherwise-safe one', async () => {
        const safeOption = getShippingOption();
        const goneOption = getShippingOptionPickUpStore();

        const previousConsignments: Consignment[] = [
            { ...getConsignment(), id: 'consignment-safe', selectedShippingOption: safeOption },
            { ...getConsignment(), id: 'consignment-broken', selectedShippingOption: goneOption },
        ];

        const refreshedConsignments: Consignment[] = [
            {
                ...getConsignment(),
                id: 'consignment-safe',
                selectedShippingOption: undefined,
                availableShippingOptions: [safeOption],
            },
            {
                ...getConsignment(),
                id: 'consignment-broken',
                selectedShippingOption: undefined,
                availableShippingOptions: [],
            },
        ];

        const { selectConsignmentShippingOption, getLatestConsignments } =
            createSelectConsignmentShippingOptionMock(refreshedConsignments);

        const didReselect = await attemptSilentShippingOptionRecovery(
            previousConsignments,
            refreshedConsignments,
            selectConsignmentShippingOption,
            getLatestConsignments,
        );

        expect(selectConsignmentShippingOption).not.toHaveBeenCalled();
        expect(didReselect).toBe(false);
    });
});

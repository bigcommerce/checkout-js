import {
    type CheckoutSelectors,
    type Consignment,
    type ShippingOption,
    type ShippingRequestOptions,
} from '@bigcommerce/checkout-sdk/essential';

import { hasSelectedShippingOptions } from '../shipping';

interface RecoveryAction {
    consignmentId: string;
    shippingOptionId: string;
}

/**
 * The SDK types declare `costAfterDiscount` as required on ShippingOption,
 * but in practice `consignment.selectedShippingOption` can come back without
 * it (only `cost` present) even though entries in that same consignment's
 * `availableShippingOptions` always have both. Rather than guessing at a
 * fallback value when the field is missing (`cost` is not a safe stand-in —
 * it's the pre-discount price, which can genuinely differ from
 * costAfterDiscount), resolve to the fully-populated entry from
 * `availableShippingOptions` when one matches by id, and only fall back to
 * the raw `selectedShippingOption` if no such entry exists.
 */
function resolveFullOption(consignment: Consignment): ShippingOption | undefined {
    const { selectedShippingOption } = consignment;

    if (!selectedShippingOption) {
        return undefined;
    }

    const fullOption = consignment.availableShippingOptions?.find(
        (option) => option.id === selectedShippingOption.id,
    );

    return fullOption || selectedShippingOption;
}

/**
 * Defensive fallback only: resolveFullOption() above should always resolve a
 * previous option with costAfterDiscount populated, since it prefers the
 * availableShippingOptions entry. This only matters if that entry was
 * somehow absent and we fell back to the raw (possibly incomplete)
 * selectedShippingOption — in that unlikely case, comparing against `cost`
 * is still better than treating a missing field as "price changed".
 */
function getEffectiveCost(option: ShippingOption): number {
    return option.costAfterDiscount ?? option.cost;
}

/**
 * Whether the set of available shipping option ids for a consignment changed
 * at all — anything added or removed, e.g. a coupon unlocking a new "Free
 * Shipping" method. Even if the previously selected option's own price is
 * untouched, a changed set of choices is a genuine, coupon-driven change to
 * what the shopper can pick from, so it should be treated the same as a
 * reprice: bail out and let them reconfirm rather than silently keeping
 * their old pick as if nothing happened.
 */
function haveAvailableOptionsChanged(
    previousConsignment: Consignment | undefined,
    newConsignment: Consignment,
): boolean {
    const previousIds = new Set(
        (previousConsignment?.availableShippingOptions ?? []).map((option) => option.id),
    );
    const newIds = new Set(
        (newConsignment.availableShippingOptions ?? []).map((option) => option.id),
    );

    if (previousIds.size !== newIds.size) {
        return true;
    }

    return [...previousIds].some((id) => !newIds.has(id));
}

/**
 * POC: when a checkout refresh (e.g. applying a coupon) causes a previously
 * selected shipping option to disappear, try to silently recover — but only
 * when nothing actually changed from the shopper's perspective: the exact
 * same set of shipping options is still on offer, and the previously
 * selected one still costs the same amount.
 *
 * Any genuine change (the option is gone, repriced under the same id, or the
 * set of available options changed at all — including a new option being
 * added) is left alone entirely — including for other consignments in the
 * same cart — so the shopper still sees the "shipping option expired"
 * reconfirmation rather than having a change applied without their
 * knowledge.
 *
 * Resolves to whether every consignment ended up with a selected shipping
 * option after the recovery attempt.
 */
export default async function attemptSilentShippingOptionRecovery(
    previousConsignments: Consignment[],
    newConsignments: Consignment[],
    selectConsignmentShippingOption: (
        consignmentId: string,
        shippingOptionId: string,
        options?: ShippingRequestOptions,
    ) => Promise<CheckoutSelectors>,
    getLatestConsignments: () => Consignment[] | undefined,
): Promise<boolean> {
    const previousConsignmentsById = new Map(
        previousConsignments.map((consignment) => [consignment.id, consignment]),
    );

    const actions: RecoveryAction[] = [];

    for (const consignment of newConsignments) {
        if (consignment.selectedShippingOption) {
            continue;
        }

        const previousConsignment = previousConsignmentsById.get(consignment.id);
        const previousOption = previousConsignment
            ? resolveFullOption(previousConsignment)
            : undefined;

        if (previousOption) {
            const matchingOption = consignment.availableShippingOptions?.find(
                (option) => option.id === previousOption.id,
            );

            const isUnchanged =
                !haveAvailableOptionsChanged(previousConsignment, consignment) &&
                matchingOption &&
                getEffectiveCost(matchingOption) === getEffectiveCost(previousOption);

            if (!isUnchanged) {
                // Genuine change (option gone, repriced under the same id,
                // or the set of choices changed at all) — bail out entirely
                // without applying any of the other, otherwise-safe
                // reselections, so the shopper sees one consistent "please
                // reconfirm shipping" outcome rather than a
                // half-silently-recovered cart.
                return false;
            }

            actions.push({ consignmentId: consignment.id, shippingOptionId: previousOption.id });
            continue;
        }

        // No previous selection at all (e.g. a newly split multi-shipping
        // consignment) — there's nothing to preserve, so picking the
        // recommended option doesn't override anything the shopper chose.
        const recommendedOption = consignment.availableShippingOptions?.find(
            (option) => option.isRecommended,
        );

        if (!recommendedOption) {
            return false;
        }

        actions.push({ consignmentId: consignment.id, shippingOptionId: recommendedOption.id });
    }

    for (const action of actions) {
        // eslint-disable-next-line no-await-in-loop
        await selectConsignmentShippingOption(action.consignmentId, action.shippingOptionId);
    }

    return hasSelectedShippingOptions(getLatestConsignments() || []);
}

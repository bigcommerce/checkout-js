import { isResolvableComponent } from '@bigcommerce/checkout-js/payment-integration';
import { ComponentType } from 'react';

export default function resolveComponent<
    TResolveId extends Record<string, unknown>, 
    TProps
>(
    query: TResolveId,
    components: Record<string, ComponentType<TProps>>
): ComponentType<TProps> | undefined {
    const results: Array<{ component: ComponentType<TProps>; matches: number }> = [];

    for (const [_, Component] of Object.entries(components)) {
        if (!isResolvableComponent<TProps, TResolveId>(Component)) {
            continue;
        }

        for (const resolverId of Component.resolveIds) {
            const result = { component: Component, matches: 0 };

            for (const [key, value] of Object.entries(resolverId)) {
                if (query[key] === value) {
                    result.matches++;
                }
            }

            results.push(result);
        }
    }

    const matched = results.sort((a, b) => b.matches - a.matches)
        .filter(result => result.matches > 0)[0];

    return matched?.component;
}

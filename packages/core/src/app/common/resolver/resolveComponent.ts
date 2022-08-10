import { isResolvableComponent } from '@bigcommerce/checkout/payment-integration-api';
import { ComponentType } from 'react';

interface ResolveResult<TProps> {
    component: ComponentType<TProps>; 
    matches: number; 
    default: boolean;
}

export default function resolveComponent<
    TResolveId extends Record<string, unknown>, 
    TProps
>(
    query: TResolveId,
    components: Record<string, ComponentType<TProps>>
): ComponentType<TProps> | undefined {
    const results: Array<ResolveResult<TProps>> = [];

    for (const [_, Component] of Object.entries(components)) {
        if (!isResolvableComponent<TProps, TResolveId>(Component)) {
            continue;
        }

        for (const resolverId of Component.resolveIds) {
            const result = { component: Component, matches: 0, default: false };

            for (const [key, value] of Object.entries(resolverId)) {
                if (query[key] === value) {
                    result.matches++;
                }

                if (key === 'default' && value === true) {
                    result.default = true;
                }
            }

            results.push(result);
        }
    }

    const matched = results.sort((a, b) => b.matches - a.matches)
        .filter(result => result.matches > 0)[0];

    return matched?.component ?? results.find(result => result.default)?.component;
}

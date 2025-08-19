import { type ComponentType } from 'react';

interface ResolveResult {
    name: string;
    matches: number;
    default: boolean;
}

export default function resolveLazyComponent<TResolveId extends Record<string, unknown>, TProps>(
    query: TResolveId,
    components: Record<string, ComponentType<TProps>>,
    registry: Record<string, readonly TResolveId[]>,
): ComponentType<TProps> | undefined {
    const results: ResolveResult[] = [];

    for (const [name, resolveIds] of Object.entries(registry)) {
        for (const resolverId of resolveIds) {
            const result = { name, matches: 0, default: false };

            for (const [key, value] of Object.entries(resolverId)) {
                if (key in query && query[key] !== value) {
                    result.matches = 0;
                    break;
                }

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

    const matched = results
        .sort((a, b) => b.matches - a.matches)
        .find((result) => result.matches > 0);

    const matchedName = matched?.name ?? results.find((result) => result.default)?.name;

    if (matchedName) {
        return components[matchedName];
    }
}

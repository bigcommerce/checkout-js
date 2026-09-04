import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

// Payment method ids with any of these prefixes may be merged when grouping is enabled
export const GROUPED_METHOD_ID_PREFIXES = ['facilypay_'] as const;

const selectAndSortPaymentMethodsByPrefix = (
    methods: PaymentMethod[],
    prefix: string,
): PaymentMethod[] | undefined => {
    const group = methods.filter((m) => m.id.startsWith(prefix));

    if (group.length <= 1) {
        return undefined;
    }

    return [...group].sort((a, b) => {
        const toNum = (id: string) => parseInt(id.slice(prefix.length), 10) || 0;

        return toNum(a.id) - toNum(b.id);
    });
};

const buildGroupedPaymentMethodRepresentative = (sortedGroup: PaymentMethod[]): PaymentMethod => {
    const [first] = sortedGroup;

    return {
        ...first,
        config: {
            ...first.config,
            displayName: first.config.displayName?.replace(/^\d+x\s+/i, ''),
        },
        initializationData: {
            ...first.initializationData,
            groupedMethods: sortedGroup,
        },
    };
};

const flatMapGroupedPaymentMethodRepresentativeIntoList = (
    methods: PaymentMethod[],
    prefix: string,
    representativeSourceId: string,
    representative: PaymentMethod,
): PaymentMethod[] =>
    methods.flatMap((m) => {
        if (!m.id.startsWith(prefix)) {
            return [m];
        }

        if (m.id === representativeSourceId) {
            return [representative];
        }

        return [];
    });

export const groupPaymentMethodsByPrefix = (
    methods: PaymentMethod[],
    prefix: string,
): PaymentMethod[] => {
    const sortedGroup = selectAndSortPaymentMethodsByPrefix(methods, prefix);

    if (!sortedGroup) {
        return methods;
    }

    const representative = buildGroupedPaymentMethodRepresentative(sortedGroup);

    return flatMapGroupedPaymentMethodRepresentativeIntoList(
        methods,
        prefix,
        representative.id,
        representative,
    );
};

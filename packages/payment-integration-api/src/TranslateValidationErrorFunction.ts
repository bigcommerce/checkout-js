export type TranslateValidationErrorFunction = (
    validationType: 'max' | 'min' | 'required' | 'invalid',
    field: {
        name: string;
        label: string;
        min?: number;
        max?: number;
    },
) => string | undefined;

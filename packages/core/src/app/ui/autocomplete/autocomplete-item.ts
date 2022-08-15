interface AutocompleteItem {
    label: string;
    highlightedSlices?: Array<{
        offset: number;
        length: number;
    }>;
    value?: string;
    id: string;
}

export default AutocompleteItem;

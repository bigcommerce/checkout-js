// intentionally shortened
const countries = {
    data: [
        {
            id: 1,
            code: 'CC',
            name: 'Dummy Country Name',
            hasPostalCodes: true,
            requiresState: false,
            subdivisions: [],
        },
        {
            id: 239,
            code: 'ZW',
            name: 'Zimbabwe',
            hasPostalCodes: false,
            requiresState: false,
            subdivisions: [],
        },
        {
            id: 13,
            code: 'AU',
            name: 'Australia',
            hasPostalCodes: true,
            requiresState: true,
            subdivisions: [
                {
                    id: 208,
                    code: 'ACT',
                    name: 'Australian Capital Territory',
                },
                {
                    id: 209,
                    code: 'NSW',
                    name: 'New South Wales',
                },
                {
                    id: 210,
                    code: 'NT',
                    name: 'Northern Territory',
                },
                {
                    id: 211,
                    code: 'QLD',
                    name: 'Queensland',
                },
                {
                    id: 212,
                    code: 'SA',
                    name: 'South Australia',
                },
                {
                    id: 213,
                    code: 'TAS',
                    name: 'Tasmania',
                },
                {
                    id: 214,
                    code: 'VIC',
                    name: 'Victoria',
                },
                {
                    id: 215,
                    code: 'WA',
                    name: 'Western Australia',
                },
            ],
        },
    ],
    meta: {},
};

export { countries };

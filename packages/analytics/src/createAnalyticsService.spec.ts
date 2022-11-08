import createAnalyticsService from './createAnalyticsService';

describe('createAnalyticsService', () => {
    it('should be created once', () => {
        const createArguments = ['create', 'arguments'];
        const createFn = jest.fn().mockImplementation((options: string[]) => options);

        const getService: () => string[] = createAnalyticsService(createFn, [createArguments]);

        expect(getService()[0]).toBe('create');
        expect(getService()[1]).toBe('arguments');
        expect(createFn).toHaveBeenCalledTimes(1);
    });

    it('should be created without arguments', () => {
        const createFn = jest.fn().mockImplementation((option: unknown) => option);

        const getService = createAnalyticsService(createFn);

        expect(getService()).toBeUndefined();
        expect(createFn).toHaveBeenCalledTimes(1);
    });
});

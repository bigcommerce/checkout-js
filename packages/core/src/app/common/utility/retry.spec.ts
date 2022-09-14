import retry from './retry';

describe('retry()', () => {
    it('retries async call for specified number of times', async () => {
        const error = new Error('Request timeout');
        const call = jest.fn(() => Promise.reject(error));

        try {
            await retry(() => call(), { count: 3, interval: 1 });
        } catch (thrown) {
            expect(call).toHaveBeenCalledTimes(3);
            expect(thrown).toEqual(error);
        }
    });

    it('stops retrying async call if it succeeds', async () => {
        let times = 0;

        const response = 'Foobar';
        const error = new Error('Request timeout');
        const call = jest.fn(() => {
            times++;

            return times === 2 ? Promise.resolve(response) : Promise.reject(error);
        });

        const output = await retry(() => call(), { interval: 1 });

        expect(call).toHaveBeenCalledTimes(2);
        expect(output).toEqual(response);
    });
});

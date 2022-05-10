import fs from 'fs';
import { EOL } from 'os';
import path from 'path';
import { promisify } from 'util';

import autoExport from './auto-export';

describe('autoExport()', () => {
    it('export matching members from files to another file', async () => {
        const options = {
            inputPath: path.join(__dirname, '/__fixtures__/**/index.ts'),
            outputPath: path.join(__dirname, '/__temp__/output.ts'),
            memberPattern: '^Component',
        };

        await autoExport(options);
        const output = await promisify(fs.readFile)(options.outputPath, { encoding: 'utf8' });

        expect(output)
            .toEqual(
                "export { ComponentA } from '../__fixtures__/auto-export/componentA';" + EOL +
                "export { ComponentB } from '../__fixtures__/auto-export/componentB';" + EOL
            );

        await promisify(fs.unlink)(options.outputPath);
    });

    it('handles scenario where no matching member is found', async () => {
        const options = {
            inputPath: path.join(__dirname, '/__fixtures__/**/index.ts'),
            outputPath: path.join(__dirname, '/__temp__/output.ts'),
            memberPattern: '^Test',
        };

        await autoExport(options);
        const output = await promisify(fs.readFile)(options.outputPath, { encoding: 'utf8' });

        expect(output)
            .toEqual('');

        await promisify(fs.unlink)(options.outputPath);
    });
});

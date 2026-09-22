/**
 * Which linked-SDK esm bundle(s) contain a given source file?
 *
 * checkout-js resolves @bigcommerce/checkout-sdk via package.json "module", i.e.
 * dist/esm/checkout-sdk.js. Only edits that land in THAT bundle can show up in the
 * checkout-js dev build. The SDK also emits ~40 other esm bundles (checkout-button,
 * checkout-sdk-essential, integrations/*) which the app does not resolve that way,
 * so a file living only in one of those will rebuild without affecting checkout-js.
 *
 * Usage, from the checkout-js root:
 *   node scripts/which-sdk-bundle.js <path-fragment>
 *   SDK_PATH=../my-sdk node scripts/which-sdk-bundle.js <path-fragment>
 *
 * Reads the emitted .js.map files, so it reflects the last SDK build — run it after
 * the SDK has built at least once.
 */
const fs = require('fs');
const path = require('path');

const RESOLVED_BUNDLE = 'dist/esm/checkout-sdk.js';

const needle = process.argv[2];

if (!needle) {
    console.error('usage: node scripts/which-sdk-bundle.js <path-fragment>');
    process.exit(2);
}

const sdkDir = path.resolve(__dirname, '..', process.env.SDK_PATH || '../checkout-sdk-js');

if (!fs.existsSync(path.join(sdkDir, 'dist', 'esm'))) {
    console.error(`❌ No dist/esm in ${sdkDir} — build the SDK first (npm run build:link).`);
    process.exit(1);
}

const hits = [];

for (const root of ['dist/esm', 'dist/esm/integrations']) {
    const absRoot = path.join(sdkDir, root);

    if (!fs.existsSync(absRoot)) continue;

    for (const file of fs.readdirSync(absRoot).filter((f) => f.endsWith('.js.map'))) {
        let map;

        try {
            map = JSON.parse(fs.readFileSync(path.join(absRoot, file), 'utf8'));
        } catch {
            continue; // half-written map from an in-flight rebuild
        }

        const matches = (map.sources || []).filter((s) => s.includes(needle));

        if (matches.length) {
            hits.push({
                bundle: `${root}/${file}`.replace(/\.map$/, ''),
                count: matches.length,
                example: matches[0].replace(/^webpack:\/\/[^/]*\//, ''),
            });
        }
    }
}

if (!hits.length) {
    console.log(`❌ "${needle}" is in no esm bundle — editing it will not affect checkout-js.`);
    console.log('   Check the path fragment, or rebuild the SDK if the file is new.');
    process.exit(1);
}

hits.sort((a, b) => (a.bundle === RESOLVED_BUNDLE ? -1 : b.bundle === RESOLVED_BUNDLE ? 1 : 0));

for (const hit of hits) {
    const live = hit.bundle === RESOLVED_BUNDLE;

    console.log(
        `${live ? '✅ LIVE-RELOADS  ' : '⚠️  other bundle  '}${hit.bundle}  (${hit.count} source(s))`,
    );
    console.log(`      e.g. ${hit.example}`);
}

if (!hits.some((h) => h.bundle === RESOLVED_BUNDLE)) {
    console.log(`\n⚠️  Not in ${RESOLVED_BUNDLE}, which is what checkout-js resolves.`);
    console.log('   The SDK watcher will rebuild, but checkout-js will not see the change.');
    process.exit(1);
}

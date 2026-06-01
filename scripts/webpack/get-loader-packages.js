const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../../packages');
const packageNames = fs
    .readdirSync(packagesDir)
    .filter((name) => fs.existsSync(path.join(packagesDir, name, 'project.json')));

const tsLoaderIncludes = [];
const aliasMap = {};

for (const packageName of packageNames) {
    const packageSrcPath = path.join(packagesDir, packageName, 'src');

    tsLoaderIncludes.push(packageSrcPath);

    aliasMap[`@bigcommerce/checkout/${packageName}`] = packageSrcPath;
}

module.exports = {
    aliasMap,
    tsLoaderIncludes,
};

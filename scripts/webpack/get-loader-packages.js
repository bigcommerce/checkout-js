const path = require('path');

const { projects } = require('../../workspace.json');

const tsLoaderIncludes = [];
const aliasMap = {};

for (const [packageName, packagePath] of Object.entries(projects)) {
    const packageSrcPath = path.join(__dirname, '../../', `${packagePath}/src`);

    tsLoaderIncludes.push(packageSrcPath);

    aliasMap[`@bigcommerce/checkout/${packageName}`] = packageSrcPath;
}

module.exports = {
    aliasMap,
    tsLoaderIncludes,
};

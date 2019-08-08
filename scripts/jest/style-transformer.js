const cwd = `${process.cwd()}/`;

module.exports = {
    process: (src, filename) => `module.exports = '${filename.replace(cwd, '')}';`,
};


const fs = require('fs');
const path = require('path');
const log = require('./log');

module.exports = async function copyFile(file, options) {
    file = path.join(options.input, file);
    const output = path.join(options.output, path.relative(options.input, file));
    
    await fs.promises.mkdir(path.dirname(output), { recursive: true });
    await fs.promises.copyFile(file, output);

    log(`Copied file ${ output }`);
};

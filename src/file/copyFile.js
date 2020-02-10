const fs = require('fs');
const path = require('path');

module.exports = async function copyFile(file, srcDir, targetDir) {
    file = path.join(srcDir, file);
    const output = path.join(targetDir, path.relative(srcDir, file));
    
    await fs.promises.mkdir(path.dirname(output), { recursive: true });
    await fs.promises.copyFile(file, output);
};

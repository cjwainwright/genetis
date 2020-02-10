const path = require('path');
const log = require('./log');
const defaultOptions = require('./defaultOptions.json');
const copyFile = require('./file/copyFile');
const deleteFiles = require('./file/deleteFiles');
const getFiles = require('./file/getFiles');
const processPartial = require('./processPartial');

module.exports = async function build(userOptions) {
    const options = { ...defaultOptions, ...userOptions };

    if(options.clean) {
        log(`Deleting files in ${options.output}`);
        await deleteFiles(options.output);
    }

    log(`Searching for files in ${options.input}`);
    let files = [];
    for(let include of options.include) {
        log(`Searching for files matching ${include}, exluding [${options.exclude.join(', ')}]`)
        let temp = await getFiles(include, options.exclude, options.input);
        files = files.concat(temp);
    }
    log(`Found ${files.length} files for processing`)

    await Promise.all(files.map(async file => {
        if(isTemplate(file, options)) {
            log(`Ignoring template ${ file }`);
        } else if(isPartial(file, options)) {
            await processPartial(file, options);
        } else {
            log(`Copying file ${ file }, from ${options.input} to ${options.output}`);
            await copyFile(file, options.input, options.output);
        }
    }));
};

function isTemplate(file, options) {
    return options.templateName == path.basename(file);
}

function isPartial(file, options) {
    const ext = path.extname(file);
    return options.partialExtensions.includes(ext);
}



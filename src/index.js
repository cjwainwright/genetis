const path = require('path');
const glob = require('glob');
const rimraf = require('rimraf');
const defaultOptions = require('./defaultOptions.json');
const log = require('./log');
const copyFile = require('./copyFile');
const processPartial = require('./processPartial');

module.exports = async function build(userOptions) {
    const options = { ...defaultOptions, ...userOptions };

    if(options.clean) {
        await deleteFiles(options.output);
    }

    let files = [];
    for(let include of options.include) {
        let temp = await getFiles(include, options.exclude, options.input);
        files = files.concat(temp);
    }

    await Promise.all(files.map(async file => {
        if(isTemplate(file, options)) {
            log(`Ignoring template ${ file }`);
        } else if(isPartial(file, options)) {
            await processPartial(file, options);
        } else {
            await copyFile(file, options);
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

async function getFiles(include, exclude, base) {
    return await new Promise((resolve, reject) => {
        glob(include, { 
            nodir: true,
            cwd: base,
            ignore: exclude 
        }, (err, files) => {
            if(err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    });
}

async function deleteFiles(pattern) {
    return await new Promise((resolve, reject) => {
        rimraf(pattern, (err) => {
            if(err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

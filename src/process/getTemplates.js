const fs = require('fs');
const path = require('path');
const log = require('../log/log');

module.exports = async function getTemplates(file, options) {
    let html = await fs.promises.readFile(file, options.fileEncoding);

    if(options.stripBom) {
        html = html.replace(/^\uFEFF/, '');
    }

    let templates;
    if(isRootHtml(html)) {
        templates = [];
    } else {
        templates = await findTemplates(path.dirname(file), options.input, options.templateName, options.fileEncoding);
    }

    templates.push({
        relative: '',
        html
    });

    return templates;
}

async function findTemplates(dir, base, templateName, encoding) {
    const templates = [];
    let currentDir = dir;
    
    let hasRemaining = false;
    let isRoot = false;
    do {
        const template = path.join(currentDir, templateName);
        try {
            const html = await fs.promises.readFile(template, encoding);
            log(`Found template ${template}`);

            if(isRootHtml(html)) {
                isRoot = true;
                log('Template is root html, terminating search');
            }

            const relative = path.relative(dir, currentDir);
            templates.unshift({
                relative,
                html
            });
        } catch(err) {
            if (err.code != 'ENOENT') {
                throw err;
            }
        }

        const remaining = path.relative(base, currentDir);
        hasRemaining = remaining != '' && remaining.indexOf('..') < 0;
        currentDir = path.join(currentDir, '../');
        
    } while (hasRemaining && !isRoot)

    return templates;
}

function isRootHtml(html) {
    return html.indexOf('<html>') >= 0 || html.indexOf('<html ') >= 0;
}
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const rimraf = require('rimraf');
const JSDOM = require('jsdom').JSDOM;

const defaultOptions = {
    base: './',
    include: '**/*',
    templateName: '_template.html',
    output: './dist',
    clean: true,
    fileEncoding: 'utf8',
};

module.exports = async function build(options = {}) {
    options = {
        ...defaultOptions,
        ...options
    };

    options = {
        ...options,
        include: path.join(options.base, options.include),
        output: path.join(options.base, options.output),
    };

    if(options.clean) {
        await deleteFiles(options.output);
    }

    let files = await getFiles(options.include);

    await Promise.all(files.map(async file => {
        const output = path.join(options.output, path.relative(options.base, file));
        await fs.promises.mkdir(path.dirname(output), { recursive: true });

        if(path.extname(file) == '.html') {
            if(path.basename(file) != options.templateName) {
                let html = await fs.promises.readFile(file, options.fileEncoding);

                // find all templates
                let dir = path.dirname(file);
                let hasRemaining = false;

                const templates = [];
                do {
                    const template = path.join(dir, options.templateName);
                    try {
                         const content = await fs.promises.readFile(template, options.fileEncoding);
                         templates.unshift(content);
                    } catch(err) {
                        if (err.code != 'ENOENT') {
                            throw err;
                        }
                    }

                    const remaining = path.relative(options.base, dir);
                    hasRemaining = remaining != '' && remaining.indexOf('..') < 0;
                    dir = path.join(dir, '../');
                } while (hasRemaining)

                // include the current html in each template in turn
                if(templates.length > 0) {
                    templates.push(html);
                    const base = templates.shift();
                    const dom = new JSDOM(base);

                    templates.forEach(template => {
                        include(dom.window.document, JSDOM.fragment(template));
                    });

                    html = dom.serialize();
                }

                await fs.promises.writeFile(output, html);
                console.log(`Written file ${ output }`);
            } else {
                console.log(`Skipping template ${ file }`);
            }
        } else {
            await fs.promises.copyFile(file, output);
            console.log(`Copied file ${ output }`);
        }
    }));
};

function updateContent(element, value) {
    if(element.hasAttribute('content')) {
        element.setAttribute('content', value);
    } else if(element.hasAttribute('src')) {
        element.setAttribute('src', value);
    } else if(element.hasAttribute('href')) {
        element.setAttribute('href', value);
    } else if(element.nodeName == 'TIME') {
        element.setAttribute('datetime', value);
        element.textContent = value; // TODO - format for display
    } else if((element.nodeName == 'METER') || (element.nodeName == 'DATA')) {
        element.setAttribute('value', value);
        element.textContent = value; // TODO - format for display
    } else {
        element.textContent = value;
    }
}

function include(doc, fragment) {
    //process variables
    fragment.querySelectorAll('data[itemprop]').forEach(data => {
        const property = data.getAttribute('itemprop');
        if(data.children.length == 0) {
            const value = data.getAttribute('value');
            data.parentNode.removeChild(data);

            doc.querySelectorAll(`[itemprop='${property}']`).forEach(item => {
                updateContent(item, value);
            });
        } else {
            console.log(`skipping data node ${property} as contains content`)
        }
    });

    //include content
    const namedSlots = doc.querySelectorAll('slot[name]');
    namedSlots.forEach(namedSlot => {
        const name = namedSlot.getAttribute('name');
        const content = fragment.querySelector(`[slot=${name}]`);
        content.removeAttribute('slot');
        
        namedSlot.parentNode.replaceChild(content, namedSlot);
    });

    const defaultSlot = doc.querySelector('slot');
    if(defaultSlot) {
        defaultSlot.parentNode.replaceChild(fragment, defaultSlot);
    }
}

async function getFiles(include) {
    return await new Promise((resolve, reject) => {
        glob(include, { nodir: true }, (err, files) => {
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

const fs = require('fs');
const path = require('path');
const url = require('url');
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

                const templates = await findTemplates(path.dirname(file), options.base, options.templateName, options.fileEncoding);

                // include the current html in each template in turn
                if(templates.length > 0) {
                    templates.push({
                        relative: '',
                        html
                    });
                    const base = templates.shift();
                    const dom = new JSDOM(base.html);
                    tagUrls(dom.window.document, base.relative);

                    templates.forEach(template => {
                        const fragment = JSDOM.fragment(template.html);
                        tagUrls(fragment, template.relative);
                        include(dom.window.document, fragment);
                    });

                    updateUrls(dom.window.document);

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

function tagUrls(doc, relative) {
    relative = relative.replace('\\', '/');
    if(relative.indexOf('..') >= 0) {
        relative += '/';
    }

    ['href', 'src'].forEach(attr => {
        doc.querySelectorAll(`[${attr}]`).forEach(a => {
            const url = a.getAttribute(attr);
            if(!a.hasAttribute('data-link-relative') && isRelativeUrl(url)) {
                console.log(`tagging url as relative for ${attr}: ${url}, ${relative}`);
                a.setAttribute('data-link-relative', relative);
            }
        });
    });
}

function updateUrls(doc) {
    ['href', 'src'].forEach(attr => {
        doc.querySelectorAll(`[${attr}][data-link-relative]`).forEach(a => {
            const url = a.getAttribute(attr);
            const relative = a.getAttribute('data-link-relative');
            const newUrl = mapUrl(url, relative);
            console.log(`updating url for ${attr}: ${url}, ${newUrl}`);
            a.setAttribute(attr, newUrl);
            a.removeAttribute('data-link-relative');
        })
    })
}

function isRelativeUrl(url) {
    return (url.indexOf('http:') != 0) &&
           (url.indexOf('https:') != 0) &&
           (url.indexOf('/') != 0);
}

function mapUrl(value, relative) {
    return url.resolve(relative, value);
}

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

async function findTemplates(dir, base, templateName, encoding) {
    const templates = [];
    let currentDir = dir;
    
    let hasRemaining = false;
    do {
        const template = path.join(currentDir, templateName);
        try {
             const html = await fs.promises.readFile(template, encoding);
             const relative = path.relative(dir, currentDir)
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
    } while (hasRemaining)

    return templates;
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

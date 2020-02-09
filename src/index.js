const fs = require('fs');
const path = require('path');
const url = require('url');
const glob = require('glob');
const rimraf = require('rimraf');
const JSDOM = require('jsdom').JSDOM;

function getDefaultOptions() {
    return {
        input: './src',
        output: './dist',
        include: ['**/*'],
        exclude: [],
        templateName: '_template.html',
        partialExtensions: ['.html', '.htm'],
        clean: true,
        fileEncoding: 'utf8'
    };
}

module.exports = async function build(userOptions) {
    const defaultOptions = getDefaultOptions();
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
            console.log(`Ignoring template ${ file }`);
        } else if(isPartial(file, options)) {
            await processPartial(file, options);
        } else {
            await copyFile(file, options);
        }
    }));
};

async function copyFile(file, options) {
    file = path.join(options.input, file);
    const output = path.join(options.output, path.relative(options.input, file));
    
    await fs.promises.mkdir(path.dirname(output), { recursive: true });
    await fs.promises.copyFile(file, output);

    console.log(`Copied file ${ output }`);
}

function isTemplate(file, options) {
    return options.templateName == path.basename(file);
}

function isPartial(file, options) {
    const ext = path.extname(file);
    return options.partialExtensions.includes(ext);
}

async function processPartial(file, options) {
    file = path.join(options.input, file);

    console.log(`Processing partial file ${file}`);
    let html = await fs.promises.readFile(file, options.fileEncoding);
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

    // include the current html in each template in turn
    if(templates.length > 0) {
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

    const output = path.join(options.output, path.relative(options.input, file));
    await fs.promises.mkdir(path.dirname(output), { recursive: true });
    await fs.promises.writeFile(output, html);
    console.log(`Written file ${ output }`);
}

var elementLinkAttributes = {
    'AUDIO': 'src',
    'EMBED': 'src',
    'IFRAME': 'src',
    'IMG': 'src',
    'SCRIPT': 'src',
    'SOURCE': 'src',
    'TRACK': 'src',
    'VIDEO': 'src',
    'A': 'href',
    'AREA': 'href',
    'LINK': 'href'
}

function tagUrls(doc, relative) {
    relative = relative.replace('\\', '/');
    if(relative.indexOf('..') >= 0) {
        relative += '/';
    }

    Object.keys(elementLinkAttributes).forEach(element => {
        var attr = elementLinkAttributes[element];
        doc.querySelectorAll(element).forEach(a => {
            const url = a.getAttribute(attr);
            if(!a.hasAttribute('data-link-relative') && (url == null || isRelativeUrl(url))) {
                console.log(`tagging url as relative for ${element}[${attr}]: ${url}, ${relative}`);
                a.setAttribute('data-link-relative', relative);
            }
        });
    });
}

function updateUrls(doc) {
    Object.keys(elementLinkAttributes).forEach(element => {
        var attr = elementLinkAttributes[element];
        doc.querySelectorAll(`${element}[data-link-relative]`).forEach(a => {
            const url = a.getAttribute(attr);
            const relative = a.getAttribute('data-link-relative');
            if(url != null && relative != null) {
                const newUrl = mapUrl(url, relative);
                console.log(`updating url for ${element}[${attr}]: ${url}, ${newUrl}`);
                a.setAttribute(attr, newUrl);
            }
            a.removeAttribute('data-link-relative');
        })
    });
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
    } else {
        switch(element.nodeName) {
            case 'AUDIO':
            case 'EMBED':
            case 'IFRAME':
            case 'IMG':
            case 'SCRIPT':
            case 'SOURCE':
            case 'TRACK':
            case 'VIDEO':
                element.setAttribute('src', value);
                break;

            case 'A':
            case 'AREA':
            case 'LINK':
                element.setAttribute('href', value);
                break;

            case 'OBJECT':
                element.setAttribute('data', value);
                break;
                                    
            case 'TIME':
                element.setAttribute('datetime', value);
                element.textContent = value; // TODO - format for display
                break;
                
            case 'METER':
            case 'DATA':
                element.setAttribute('value', value);
                element.textContent = value; // TODO - format for display
                break;
                
            default:
                element.textContent = value;
                break;
        }
    }
}

function include(doc, fragment) {
    //process variables
    fragment.querySelectorAll('meta[itemprop]').forEach(data => {
        const property = data.getAttribute('itemprop');
        const value = data.getAttribute('content');
        data.parentNode.removeChild(data);

        doc.querySelectorAll(`[itemprop='${property}']`).forEach(item => {
            updateContent(item, value);
        });
    });

    //special slots
    const specialSlots = {
        'head': 'head'
    };

    Object.keys(specialSlots).forEach(name => {
        fragment.querySelectorAll(`[slot='${name}']`).forEach(content => {
            content.removeAttribute('slot');
            const element = doc.querySelector(specialSlots[name]);
            if(element == null) {
                console.log(`special slot ${name} not found`);
            } else {
                element.appendChild(content);
            }
        });
    });

    //include content
    const namedSlots = doc.querySelectorAll('slot[name]');
    namedSlots.forEach(namedSlot => {
        const name = namedSlot.getAttribute('name');
        const content = fragment.querySelector(`[slot='${name}']`);
        if(content == null) {
            namedSlot.parentNode.removeChild(namedSlot);
        } else {
            content.removeAttribute('slot');
            namedSlot.parentNode.replaceChild(content, namedSlot);
        }
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
    let isRoot = false;
    do {
        const template = path.join(currentDir, templateName);
        try {
            const html = await fs.promises.readFile(template, encoding);
            console.log(`Found template ${template}`);

            if(isRootHtml(html)) {
                isRoot = true;
                console.log('Template is root html, terminating search');
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
